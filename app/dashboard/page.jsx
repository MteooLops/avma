'use client';
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [worlds, setWorlds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Check session and load user + friends
    useEffect(() => {
        const initializeDashboard = async () => {
            const hasSession = localStorage.getItem("hasVRChatSession");
            if (!hasSession) {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("/api/auth", { method: "GET" });
                if (!res.ok) {
                    localStorage.removeItem("hasVRChatSession");
                    router.push("/login");
                    return;
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
            const res = await fetch("/api/friends", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const text = await res.text();
            let data = JSON.parse(text);

            if (res.ok) {
                setFriends(data.friends || []);
            } else {
                console.error("Error loading friends:", data.error);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    const handleGetFriends = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/friends", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const text = await res.text();
            let data = JSON.parse(text);

            if (res.ok) {
                setFriends(data.friends || []);
                setStatus("Friends loaded: " + (data.friends?.length || 0));
            } else {
                setStatus(data.error || "Error loading friends");
            }
        } catch (error) {
            setStatus("Error loading friends: " + error.message);
        } finally {
            setLoading(false);
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
        if (!searchTerm.trim()) {
            setStatus("Enter a search term");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`/api/worlds?search=${encodeURIComponent(searchTerm)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const text = await res.text();
            let data = JSON.parse(text);

            if (res.ok) {
                setWorlds(data.worlds || []);
                setStatus("Worlds found: " + (data.worlds?.length || 0));
            } else {
                setStatus(data.error || "Error searching worlds");
            }
        } catch (error) {
            setStatus("Error searching worlds: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div style={{ padding: "20px" }}>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <main>
                {status && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "#eef2ff", border: "1px solid #cfd8ff" }}>
                        {status}
                    </div>
                )}

                {/* USER SECTION */}
                <div className="header">
                    <h2>Welcome, {user.displayName || user.username}</h2>
                    <p>ID: {user.id}</p>
                    <button
                        onClick={handleLogout}
                        style={{ padding: "10px 20px", cursor: "pointer", background: "red", color: "white" }}
                    >
                        Logout
                    </button>
                </div>

                {/* FRIENDS SECTION */}
                <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
                    <h2>My Friends</h2>
                    {friends.length > 0 ? (
                        <ul>
                            {friends.map((friend) => (
                                <li key={friend.id} style={{ marginBottom: "5px" }}>
                                    <strong>{friend.displayName}</strong> - {friend.status || "Offline"}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No friends or not loaded</p>
                    )}
                </div>

                {/* WORLD SEARCH SECTION */}
                <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
                    <h2>Search Worlds</h2>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="E.g.: Void, Black Cat, Meowww"
                        style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
                    />
                    <button
                        onClick={handleSearchWorlds}
                        disabled={loading}
                        style={{ padding: "10px 20px", marginBottom: "10px", cursor: "pointer" }}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                    {worlds.length > 0 ? (
                        <ul>
                            {worlds.map((world) => (
                                <li key={world.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd" }}>
                                    <strong>{world.name}</strong>
                                    <p>Author: {world.authorName}</p>
                                    <p>Players: {world.occupants}/{world.capacity}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No worlds or not searched</p>
                    )}
                </div>
            </main>
        </div>
    );
}
