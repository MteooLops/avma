import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function POST(req) {
    try {
        const vrchat = getVRChatInstance() || getVRChatClient();

        const response = await vrchat.getAvatar()

        return NextResponse.json({ success: true, data: response?.data || response });
    } catch (error) {
        console.error("Avatar Error:", error);
        return NextResponse.json({ error: error?.message || "Failed fetch Avatars" }, { status: 400 });
    }
}
