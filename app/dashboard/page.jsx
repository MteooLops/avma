'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import FriendsPanel from "./components/FriendsPanel";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import QuickLaunch from "./components/QuickLaunch";
import SummaryCard from "./components/SummaryCard";
import WorldsSearch from "./components/WorldsSearch";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [worlds, setWorlds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // friends panel state
    const [onlineOpen, setOnlineOpen] = useState(true);
    const [webOpen, setWebOpen] = useState(true);
    const [offlineOpen, setOfflineOpen] = useState(true);

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

            console.log('fetched friends response', data);

            if (res.ok && data) {
                // handle multiple possible response shapes
                if (Array.isArray(data)) {
                    setFriends(data);
                } else if (Array.isArray(data.friends)) {
                    setFriends(data.friends);
                } else if (data.onlineFriends || data.webFriends || data.offlineFriends) {
                    const merged = [
                        ...(data.onlineFriends || []),
                        ...(data.webFriends || []),
                        ...(data.offlineFriends || []),
                    ];
                    // dedupe by id
                    const byId = {};
                    merged.forEach((f) => {
                        if (f && f.id) byId[f.id] = f;
                    });
                    setFriends(Object.values(byId));
                } else {
                    // unknown shape — keep empty
                    setFriends([]);
                }
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

    const handleSearchWorlds = async () => {
        if (!searchTerm.trim()) return setStatus("Enter a search term");
        try {
            setLoading(true);
            const res = await fetch(`/api/worlds?search=${encodeURIComponent(searchTerm)}`, { method: "GET", headers: { "Content-Type": "application/json" } });
            const text = await res.text();
            const data = JSON.parse(text);
            if (res.ok) {
                setWorlds(data.worlds || []);
                setStatus(`Worlds found: ${data.worlds?.length || 0}`);
            } else setStatus(data.error || "Error searching worlds");
        } catch (error) {
            setStatus("Error searching worlds: " + (error.message || error));
        } finally {
            setLoading(false);
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
            <Sidebar />

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
                <Header user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearchWorlds} status={status} onLogout={handleLogout} loading={loading} />

                <main className="p-6 space-y-6">
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <QuickLaunch userId={user.id} onLaunch={handleQuickLaunch} onRefresh={loadFriends} loading={loading} />

                        <SummaryCard friendsCount={friends.length} onRefresh={loadFriends} />

                        <WorldsSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearchWorlds} worlds={worlds} loading={loading} />
                    </section>
                </main>
            </div>
        </div>
    );
}
