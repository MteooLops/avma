import { VRChat, VRChatError } from "vrchat";
import { NextResponse } from "next/server";
import KeyvFile from "keyv-file";
import path from "path";

let vrchatInstance = null;

const keyvStore = new KeyvFile({
    filename: path.join(process.cwd(), ".vrchat-session.json"),
});

function createVRChatClient() {
    return new VRChat({
        application: {
            name: "AVMA",
            version: "0.0.1",
            contact: "vrmteoo@gmail.com",
        },
        baseUrl: "https://api.vrchat.cloud/api/1",
        keyv: keyvStore,
    });
}

export async function POST(req) {
    try {
        const { username, password, twoFactorCode } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        if (twoFactorCode) {
            try {
                const vrchat = createVRChatClient();
                const loginResult = await vrchat.login({
                    username,
                    password,
                    twoFactorCode: async () => twoFactorCode,
                    throwOnError: true,
                });

                const currentUserResponse = await vrchat.getCurrentUser({ throwOnError: true });
                const user = currentUserResponse?.data || currentUserResponse;

                if (!user) {
                    return NextResponse.json(
                        { message: "No se retornaron datos del usuario" },
                        { status: 401 }
                    );
                }

                vrchatInstance = vrchat;

                return NextResponse.json({ success: true, user }, { status: 200 });
            } catch (loginError) {
                console.error("VRChat 2FA error:", loginError);
                return NextResponse.json(
                    { message: "Código 2FA inválido" },
                    { status: 401 }
                );
            }
        }

        const vrchat = createVRChatClient();

        let loginResult;
        try {
            const loginOptions = {
                username,
                password,
                throwOnError: true,
            };

            loginResult = await vrchat.login(loginOptions);
        } catch (loginError) {
            console.error("VRChat login error:", loginError);
            const message = loginError?.message || "Authentication failed";
            const needs2fa = Boolean(
                (loginError instanceof VRChatError && loginError.requiresTwoFactorAuth) ||
                message.toLowerCase().includes("two-factor") ||
                message.toLowerCase().includes("2fa")
            );

            if (needs2fa && !twoFactorCode) {
                return NextResponse.json(
                    { message: "Se requiere autenticación de dos factores", requiresTwoFactor: true },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { message: "Credenciales inválidas", requiresTwoFactor: false },
                { status: 401 }
            );
        }

        let user;
        try {
            const currentUserResponse = await vrchat.getCurrentUser({ throwOnError: true });
            user = currentUserResponse?.data || currentUserResponse;
        } catch (getUserError) {
            console.error("Error getting current user:", getUserError);
            return NextResponse.json(
                { message: "Error al obtener datos del usuario después del login" },
                { status: 401 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { message: "No se retornaron datos del usuario" },
                { status: 401 }
            );
        }

        vrchatInstance = vrchat;

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error("Unexpected auth error:", error);
        return NextResponse.json(
            { message: error?.message || "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export function getVRChatInstance() {
    return vrchatInstance;
}

export function getVRChatClient() {
    return createVRChatClient();
}

// GET: devuelve usuario actual si la sesión persistente sigue válida
export async function GET() {
    try {
        const vrchat = getVRChatInstance() || getVRChatClient();
        const currentUserResponse = await vrchat.getCurrentUser({ throwOnError: true });
        const user = currentUserResponse?.data || currentUserResponse;

        vrchatInstance = vrchat;

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        if (error instanceof VRChatError && error.unauthorized) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }
        return NextResponse.json({ message: error?.message || "Error al obtener usuario actual" }, { status: 400 });
    }
}

// DELETE: limpia la sesión y cierra la instancia
export async function DELETE() {
    try {
        vrchatInstance = null;

        try {
            await keyvStore.clear();
        } catch (clearError) {
            console.error("Error clearing keyv store:", clearError);
        }

        return NextResponse.json({ success: true, message: "Sesión cerrada" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json({ message: "Error al cerrar sesión" }, { status: 500 });
    }
}
