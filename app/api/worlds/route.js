import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const worldId = searchParams.get("id");


        // Si se proporciona un ID, obtén los detalles del mundo
        if (worldId) {
            // Extraer solo el ID base del mundo (antes del ':')
            const cleanWorldId = worldId.split(':')[0];

            const vrchat = getVRChatInstance() || getVRChatClient();
            const worldResponse = await vrchat.getWorld({ path: { worldId: cleanWorldId } });
            let world = worldResponse?.data || worldResponse;

            // Convertir BigInt a string para poder serializar
            world = JSON.parse(JSON.stringify(world, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            return NextResponse.json({
                success: true,
                world: world
            });
        }

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
            query: {
                search: search,
                sort: 'relevance'
            }
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