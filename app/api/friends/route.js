import { VRChat } from "vrchat";
import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function GET(req) {
    try {
        const vrchat = getVRChatInstance() || getVRChatClient();

        let onlineFriends = [];
        let offlineFriends = [];
        let webFriends = [];

        // Fetch online friends with pagination
        let lastOnlineFriendLength = 0;
        while (true) {
            let onlineFriendsResponse = await vrchat.getFriends({
                query: {
                    offset: lastOnlineFriendLength,
                    n: 60,
                    offline: false,
                }
            })
            let onlineFriendsData = onlineFriendsResponse?.data || onlineFriendsResponse || [];

            if (onlineFriendsData.length == 0) break;

            onlineFriends = onlineFriends.concat(onlineFriendsData);
            lastOnlineFriendLength += onlineFriendsData.length;
        }

        // Fetch offline friends with pagination
        let lastOfflineFriendLength = 0;
        while (true) {
            let offlineFriendsResponse = await vrchat.getFriends({
                query: {
                    offset: lastOfflineFriendLength,
                    n: 60,
                    offline: true,
                }
            })
            let offlineFriendsData = offlineFriendsResponse?.data || offlineFriendsResponse || [];

            if (offlineFriendsData.length == 0) break;

            offlineFriends = offlineFriends.concat(offlineFriendsData);
            lastOfflineFriendLength += offlineFriendsData.length;
        }


        // Extract web friends from online friends
        webFriends = onlineFriends.filter(friend => friend.platform == 'web')
        let friendWorlds = onlineFriends.filter(friend => friend.location.startsWith("wrld_"))
        let totalCount = onlineFriends.length + offlineFriends.length


        return NextResponse.json({ success: true, onlineFriends, webFriends, offlineFriends, totalCount, friendWorlds });
    } catch (error) {
        console.error("Get friends error:", error);
        return NextResponse.json({ error: error?.message || "Failed to fetch friends" }, { status: 400 });
    }
}