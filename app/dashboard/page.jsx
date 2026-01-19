'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import FriendsPanel from "./components/FriendsPanel";

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
            {/* Left sidebar */}
            <aside className="fixed top-0 left-0 h-screen sidebar p-3">
                <div className="card p-3 fade-in">
                    <div className="flex items-center gap-3">
                        <div className="avatar">VR</div>
                        <div>
                            <div className="small muted">Launcher</div>
                            <div className="font-semibold">VRChat</div>
                        </div>
                    </div>
                </div>

                <nav className="mt-4 space-y-2">
                    {[
                        { label: "Home", href: "/dashboard" },
                        { label: "Friends", href: "/dashboard" },
                        { label: "Worlds", href: "/dashboard" },
                        { label: "Library", href: "/dashboard" },
                        { label: "Settings", href: "/dashboard" },
                    ].map((item) => (
                        <a key={item.label} href={item.href} className="nav-item flex items-center gap-3 small muted">
                            <div className="w-9 h-9 center card"> </div>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>
            </aside>

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
                <header className="sticky top-0 z-10 header-glass">
                    <div className="h-16 px-6 flex items-center gap-4 justify-between">
                        <div className="flex-1 flex items-center gap-3">
                            <input
                                aria-label="Search worlds or friends"
                                className="input w-full max-w-2xl px-3 py-2 text-sm"
                                placeholder="Search worlds or friends..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn" onClick={handleSearchWorlds} disabled={loading} aria-label="Search">
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="avatar small">{(user.displayName || user.username || "?").charAt(0).toUpperCase()}</div>
                                <div className="small muted">{user.displayName || user.username}</div>
                            </div>
                            <button className="btn" onClick={handleLogout} aria-label="Sign out">
                                Sign out
                            </button>
                        </div>
                    </div>
                    {status && (
                        <div className="px-6 pb-3">
                            <div className="card px-3 py-2 small muted">{status}</div>
                        </div>
                    )}
                </header>

                <main className="p-6 space-y-6">
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="card p-4 fade-in">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Quick Launch</h2>
                                <span className="small muted">ID: {user.id}</span>
                            </div>
                            <p className="mt-2 small muted">Start VRChat and return where you left off.</p>
                            <div className="mt-4 flex items-center gap-3">
                                <button className="btn btn-primary" onClick={handleQuickLaunch} aria-label="Launch VRChat">
                                    Launch VRChat
                                </button>
                                <button className="btn" onClick={loadFriends} aria-label="Refresh friends">
                                    Refresh friends
                                </button>
                            </div>
                        </div>

                        <div className="card p-4 fade-in">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Summary</h2>
                                <div className="small muted">Friends: {friends.length}</div>
                            </div>
                            <p className="mt-2 small muted">Friends panel is on the right. Use it to see online/offline lists.</p>
                            <div className="mt-4 flex items-center gap-3">
                                <button className="btn" onClick={loadFriends} aria-label="Refresh friends">Refresh friends</button>
                            </div>
                        </div>

                        <div className="card p-4 fade-in">
                            <h2 className="font-semibold">Search worlds</h2>
                            <p className="mt-2 small muted">Examples: Void, Black Cat, Cozy Cafe</p>

                            <div className="mt-3 space-y-3">
                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                    <input className="input px-3 py-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="World name" />
                                    <button className="btn" onClick={handleSearchWorlds} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                                </div>

                                <div className="space-y-3">
                                    {worlds.length > 0 ? (
                                        worlds.map((world) => (
                                            <div key={world.id} className="p-3 rounded-md card flex items-center justify-between" role="article" aria-label={`World ${world.name}`}>
                                                <div>
                                                    <div className="font-medium">{world.name}</div>
                                                    <div className="small muted">Author: {world.authorName}</div>
                                                </div>
                                                <div className="small muted">{world.occupants}/{world.capacity}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="small muted">No results yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
