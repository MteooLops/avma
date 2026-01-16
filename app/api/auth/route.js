import { VRChat, VRChatError } from "vrchat";
import { NextResponse } from "next/server";
import KeyvFile from "keyv-file";
import path from "path";

// Variable global para guardar la instancia de VRChat durante la sesión
let vrchatInstance = null;

// Store persistente para sesiones (cookies / tokens)
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

        console.log("Attempting login with username:", username);

        // Crea una nueva instancia de VRChat con la configuración correcta (usa sesión persistente)
        const vrchat = createVRChatClient();

        // Intenta hacer login con las credenciales
        let loginResult;
        try {
            loginResult = await vrchat.login({
                username,
                password,
                twoFactorCode: twoFactorCode ? () => twoFactorCode : undefined,
                throwOnError: true,
            })
            console.log("Login result:", loginResult);
        } catch (loginError) {
            console.error("VRChat login error:", loginError);
            const message = loginError?.message || "Authentication failed";
            const needs2fa = Boolean(
                (loginError instanceof VRChatError && loginError.requiresTwoFactorAuth) ||
                message.toLowerCase().includes("two-factor") ||
                message.toLowerCase().includes("2fa")
            );

            // Si se requiere 2FA y no se envió código, pedirlo sin marcar error de credenciales
            if (needs2fa && !twoFactorCode) {
                return NextResponse.json(
                    { error: "2FA code required", require2fa: true },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: "Invalid credentials", require2fa: false },
                { status: 401 }
            );
        }

        // Ahora obtén los datos del usuario autenticado
        let user;
        try {
            const currentUserResponse = await vrchat.getCurrentUser({ throwOnError: true });
            user = currentUserResponse?.data || currentUserResponse;
            console.log("Current user:", user);
        } catch (getUserError) {
            console.error("Error getting current user:", getUserError);
            return NextResponse.json(
                { error: "Failed to retrieve user data after login" },
                { status: 401 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: "No user data returned" },
                { status: 401 }
            );
        }

        console.log("Login successful for user:", user.displayName || user.username || user.id);

        // Guarda la instancia para usarla en otras rutas
        vrchatInstance = vrchat;

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Unexpected auth error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Exporta la instancia para que otras rutas puedan usarla
export function getVRChatInstance() {
    return vrchatInstance;
}

// Exporta un cliente nuevo que reutiliza la sesión persistente
export function getVRChatClient() {
    return createVRChatClient();
}

// GET: devuelve usuario actual si la sesión persistente sigue válida
export async function GET() {
    try {
        const vrchat = getVRChatInstance() || getVRChatClient();
        const currentUserResponse = await vrchat.getCurrentUser({ throwOnError: true });
        const user = currentUserResponse?.data || currentUserResponse;

        // Si venimos de sesión persistida y no se había cargado en memoria, la guardamos
        vrchatInstance = vrchat;

        return NextResponse.json({ success: true, user });
    } catch (error) {
        if (error instanceof VRChatError && error.unauthorized) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }
        return NextResponse.json({ error: error?.message || "Failed to get current user" }, { status: 400 });
    }
}

// DELETE: limpia la sesión y cierra la instancia
export async function DELETE() {
    try {
        // Limpia la instancia en memoria
        vrchatInstance = null;

        // Limpia el store persistente
        try {
            await keyvStore.clear();
        } catch (clearError) {
            console.error("Error clearing keyv store:", clearError);
        }

        return NextResponse.json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}
