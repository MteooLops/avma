import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");

        if (!search) {
            return NextResponse.json(
                { error: "Parámetro 'search' requerido" },
                { status: 400 }
            );
        }

        // Usa instancia en memoria si existe; si no, crea una con sesión persistente
        const vrchat = getVRChatInstance() || getVRChatClient();

        // Busca mundos por nombre o descripción
        const worldsResponse = await vrchat.searchWorlds({
            search: search,
            sort: "name",
        });
        const worlds = worldsResponse?.data || worldsResponse || [];

        return NextResponse.json({
            success: true,
            worlds: worlds
        });
    } catch (error) {
        console.error("Search worlds error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to search worlds" },
            { status: 400 }
        );
    }
}
