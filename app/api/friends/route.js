import { VRChat } from "vrchat";
import { NextResponse } from "next/server";
import { getVRChatInstance, getVRChatClient } from "../auth/route";

export async function GET(req) {
    try {
        const vrchat = getVRChatInstance() || getVRChatClient();

        let friendsResponse = await vrchat.getFriends();
        let friends = friendsResponse?.data || friendsResponse || [];

        let offlineFriends = [];

        let lastOfflineFriendLength = 0;
        while (true) {
            /*if (lastOfflineFriendLength > 0) { 
                // TODO: Deslimitar el numero de amigos que salen de resultado, por defecto esta limitado a 100
                let offlineFriendsResponse = await vrchat.getFriends({
                    query: {
                        offset: lastOfflineFriendLength,
                        n: 60,
                        offline: true,
                    }
                })
                let offlineFriends = offlineFriendsResponse?.data || offlineFriendsResponse || [];

                lastOfflineFriendLength = offlineFriends.length;
            } */
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

        let webFriends = friends.filter(friend => friend.platform == 'web')
        let onlineFriends = friends.filter(friend => friend.location != 'offline')

        let totalCount = friends.length + offlineFriends.length


        return NextResponse.json({ success: true, onlineFriends, webFriends, offlineFriends, totalCount });
    } catch (error) {
        console.error("Get friends error:", error);
        return NextResponse.json({ error: error?.message || "Failed to fetch friends" }, { status: 400 });
    }
}