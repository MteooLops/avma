import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function POST(req) {
    try {
        const vrchat = getVRChatInstance() || getVRChatClient();
        const { worldId, instanceId } = await req.json();

        if (!worldId || !instanceId) {
            return NextResponse.json({ error: "World ID and Instance ID are required" }, { status: 400 });
        }

        // Invite myself to the world instance
        const response = await vrchat.inviteMyselfTo({ path: { worldId: worldId, instanceId: instanceId } });

        return NextResponse.json({ success: true, data: response?.data || response });
    } catch (error) {
        console.error("Invite myself error:", error);
        return NextResponse.json({ error: error?.message || "Failed to invite myself" }, { status: 400 });
    }
}
