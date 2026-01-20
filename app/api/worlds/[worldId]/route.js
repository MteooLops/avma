import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../../auth/route";

export async function GET(req, context) {
    try {
        const { worldId } = await context.params; // params is a Promise in Next 16

        if (!worldId) {
            return NextResponse.json({ error: "World ID is required" }, { status: 400 });
        }

        const vrchat = getVRChatInstance() || getVRChatClient();

        // Get world details
        const response = await vrchat.getWorld(worldId);
        const worldData = response?.data || response;

        return NextResponse.json({
            success: true,
            data: {
                id: worldData.id,
                name: worldData.name,
                authorName: worldData.authorName,
                description: worldData.description,
                imageUrl: worldData.imageUrl,
                occupants: worldData.occupants,
                capacity: worldData.capacity,
                releaseStatus: worldData.releaseStatus,
                tags: worldData.tags
            }
        });
    } catch (error) {
        console.error("Get world error:", error);
        return NextResponse.json({ error: error?.message || "Failed to fetch world" }, { status: 400 });
    }
}
