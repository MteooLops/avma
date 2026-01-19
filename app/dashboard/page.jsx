'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import FriendsPanel from "./components/FriendsPanel";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import QuickLaunch from "./components/QuickLaunch";
import WorldsSearch from "./components/WorldsSearch";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // friends panel state
    const [onlineOpen, setOnlineOpen] = useState(true);
    const [webOpen, setWebOpen] = useState(false);
    const [offlineOpen, setOfflineOpen] = useState(false);

    useEffect(() => {
        const initializeDashboard = async () => {
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
        initializeDashboard();
    }, [router]);

    const loadFriends = async () => {
        try {
            const res = await fetch("/api/friends", { method: "GET", headers: { "Content-Type": "application/json" } });
            const data = await res.json();

            if (res.ok && data) {
                setFriends(data)
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
            setWorlds([]);
            setStatus("");
            localStorage.removeItem("hasVRChatSession");
            setLoading(false);
            router.push("/login");
        }
    };

    const handleQuickLaunch = () => {
        setStatus("Launching VRChat...");
        setTimeout(() => setStatus("Ready to play"), 1200);
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center center">Loading...</div>;

    return (
        <div className="min-h-screen text-gray-200">
            {/* Left sidebar (component) */}
            <Sidebar user={user} />

            {/* Right friends panel (component) */}
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

            {/* Main content - add right padding for friends panel */}
            <div className="pl-28 lg:pl-64" style={{ paddingRight: 416 }}>
                <Header status={status} onLogout={handleLogout} loading={loading} />

                <main className="p-6 space-y-6">
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <QuickLaunch userId={user.id} onLaunch={handleQuickLaunch} onRefresh={loadFriends} loading={loading} />

                        <WorldsSearch />
                    </section>
                </main>
            </div>
        </div>
    );
}
