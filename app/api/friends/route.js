import { VRChat } from "vrchat";
import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function GET(req) {
    try {
        // Usa instancia en memoria si existe; si no, crea una con sesión persistente
        const vrchat = getVRChatInstance() || getVRChatClient();

        // Obtiene la lista de amigos del usuario autenticado
        const friendsResponse = await vrchat.getFriends();
        const friends = friendsResponse?.data || friendsResponse || [];

        return NextResponse.json({
            success: true,
            friends: friends
        });
    } catch (error) {
        console.error("Get friends error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to fetch friends" },
            { status: 400 }
        );
    }
}
