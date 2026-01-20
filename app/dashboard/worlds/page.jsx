'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../globals.css";
import WorldsSearch from "../components/WorldsSearch";
import FriendsPanel from "../components/FriendsPanel";
import Sidebar from "../components/Sidebar";

export default function WorldsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const [onlineOpen, setOnlineOpen] = useState(true);
    const [webOpen, setWebOpen] = useState(false);
    const [offlineOpen, setOfflineOpen] = useState(false);

    useEffect(() => {
        const initializeView = async () => {
            const hasSession = localStorage.getItem("hasVRChatSession");
            if (!hasSession) return router.push("/login");

            try {
                const res = await fetch("/api/auth", { method: "GET" });
                if (!res.ok) {
                    localStorage.removeItem("hasVRChatSession");
                    return router.push("/login");
                }
                const data = await res.json();
                if (data?.user) {
                    setUser(data.user);
                    loadFriends();
                }
            } catch (err) {
                console.error("Session check error:", err);
                router.push("/login");
            }
        };
        initializeView();
    }, [router]);

    const loadFriends = async () => {
        try {
            const res = await fetch("/api/friends", { method: "GET", headers: { "Content-Type": "application/json" } });
            const data = await res.json();

            if (res.ok && data) {
                setFriends(data);
                localStorage.setItem('vrchat_friends', JSON.stringify(data));
            } else {
                console.error("Error loading friends:", data?.error || data);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await fetch("/api/auth", { method: "DELETE" });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setFriends([]);
            setStatus("");
            localStorage.removeItem("hasVRChatSession");
            setLoading(false);
            router.push("/login");
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center center">Loading...</div>;

    return (
        <div className="min-h-screen text-gray-200">
            <Sidebar user={user} onLogout={handleLogout} loading={loading} />
            <FriendsPanel
                friends={friends}
                selectedFriend={selectedFriend}
                setSelectedFriend={setSelectedFriend}
                onlineOpen={onlineOpen}
                setOnlineOpen={setOnlineOpen}
                webOpen={webOpen}
                setWebOpen={setWebOpen}
                offlineOpen={offlineOpen}
                setOfflineOpen={setOfflineOpen}
            />

            <div className="pl-28 lg:pl-64 flex flex-col" style={{ paddingRight: 416, height: "100vh", overflow: "hidden" }}>
                <main className="flex flex-col gap-4 flex-1 p-6 overflow-hidden w-full h-full">
                    <WorldsSearch />
                </main>
            </div>
        </div>
    );
}
