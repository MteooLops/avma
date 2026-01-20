"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../globals.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { normalizeFriendStatus, getStatusTone } from "../utils/friendUtils";

export default function MyProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [worldName, setWorldName] = useState(null);
    const [worldLoading, setWorldLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    const copyToClipboard = async (text, label) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setStatus(`${label} copied`);
            setTimeout(() => setStatus(""), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
            setStatus(`Failed to copy ${label}`);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
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
                }
            } catch (err) {
                console.error("Error loading user:", err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [router]);

    useEffect(() => {
        if (!user) return;
        if (user.location && user.location !== "private" && user.location !== "offline") {
            const worldId = user.location.split(":")[0];
            if (!worldId) return;
            setWorldLoading(true);
            fetch(`/api/worlds/${worldId}`)
                .then(res => res.json())
                .then(data => {
                    if (data?.success && data.data?.name) {
                        setWorldName(data.data.name);
                    } else {
                        setWorldName(null);
                    }
                    setWorldLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching world name:", err);
                    setWorldName(null);
                    setWorldLoading(false);
                });
        } else {
            setWorldName(null);
            setWorldLoading(false);
        }
    }, [user?.location]);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await fetch("/api/auth", { method: "DELETE" });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("hasVRChatSession");
            router.push("/login");
        }
    };

    if (!user || loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const normalized = normalizeFriendStatus(user);
    const statusTone = getStatusTone(normalized.displayStatus, normalized.displayLocation);
    const inWorld = Boolean(user.location && user.location !== "private" && user.location !== "offline");
    const locationText = inWorld ? (worldName || (worldLoading ? "Loading world..." : "")) : normalized.displayLocation;

    return (
        <div className="min-h-screen text-gray-200">
            <Sidebar user={user} />

            <div className="pl-28 lg:pl-64" style={{ paddingRight: 64 }}>
                <Header status={status} onLogout={handleLogout} loading={loading} />

                <main className="p-6 space-y-6 pb-12">
                    {/* Hero card */}
                    <div className="card p-8" style={{ background: "linear-gradient(135deg, rgba(69,88,255,0.12), rgba(0, 255, 204, 0.08))" }}>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <img
                                src={user.currentAvatarImageUrl || user.imageUrl}
                                alt={user.displayName || user.username}
                                className="w-32 h-32 rounded-xl object-cover shadow-lg border border-white/10"
                            />
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold">{user.displayName || user.username}</h1>
                                    <span className={`status-dot ${statusTone}`} aria-hidden="true" />
                                    <span className="small muted">{normalized.displayStatus}</span>
                                </div>
                                <div className="small muted">@{user.username}</div>
                                {user.statusDescription && (
                                    <div className="font-medium text-base">{user.statusDescription}</div>
                                )}
                                <div className="flex flex-wrap gap-3">
                                    <button className="btn" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
                                    {inWorld && (
                                        <button className="btn" onClick={() => window.location.href = `vrchat://launch?ref=vrchat.com&id=${user.location}`}>
                                            Join My Instance
                                        </button>
                                    )}
                                    <button className="btn" onClick={() => window.location.href = "vrchat://launch"}>Open VRChat</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="card p-5">
                            <div className="small muted mb-1">Location</div>
                            <div className="font-semibold text-lg">{locationText || "Unknown"}</div>
                            {inWorld && user.location && (
                                <div className="small muted mt-1" style={{ opacity: 0.7 }}>
                                    {user.location.split(":")[0]}
                                </div>
                            )}
                        </div>
                        <div className="card p-5">
                            <div className="small muted mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                <span className={`status-dot ${statusTone}`} aria-hidden="true" />
                                <span className="font-semibold text-lg">{normalized.displayStatus}</span>
                            </div>
                        </div>
                        <div className="card p-5">
                            <div className="small muted mb-1">Platform</div>
                            <div className="font-semibold text-lg capitalize">{user.platform || user.last_platform || "Unknown"}</div>
                        </div>
                    </div>

                    {/* Bio / About */}
                    {user.bio && (
                        <div className="card p-6">
                            <div className="small muted mb-2">Bio</div>
                            <div className="font-medium leading-relaxed whitespace-pre-wrap">{user.bio}</div>
                        </div>
                    )}

                    {/* World section */}
                    {inWorld && (
                        <div className="card p-6">
                            <h2 className="font-semibold text-xl mb-3">Current World</h2>
                            {worldName && <div className="font-semibold text-lg mb-2">{worldName}</div>}
                            {worldLoading && <div className="small muted">Loading world...</div>}
                            <div>
                                <div className="small muted mb-1">Instance ID</div>
                                <div className="font-medium break-all p-3 rounded" style={{ background: "rgba(255,255,255,0.02)", fontFamily: "monospace", fontSize: "0.9rem" }}>
                                    {user.location}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Technical Details */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-xl mb-3">Technical Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="p-3 rounded border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="small muted">User ID</div>
                                    {user.id && (
                                        <button className="btn px-2 py-1" onClick={() => copyToClipboard(user.id, 'User ID')}>Copy</button>
                                    )}
                                </div>
                                <div className="font-medium break-all" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{user.id || "N/A"}</div>
                            </div>
                            <div className="p-3 rounded border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="small muted mb-1">Username</div>
                                <div className="font-semibold">{user.username || "N/A"}</div>
                            </div>
                            <div className="p-3 rounded border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="small muted mb-1">Developer Type</div>
                                <div className="font-semibold">{user.developerType || "User"}</div>
                            </div>
                            <div className="p-3 rounded border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="small muted mb-1">Last Platform</div>
                                <div className="font-semibold capitalize">{user.last_platform || user.platform || "Unknown"}</div>
                            </div>
                            <div className="p-3 rounded border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="small muted">World ID</div>
                                    {inWorld && user.location && (
                                        <button className="btn px-2 py-1" onClick={() => copyToClipboard(user.location.split(":")[0], 'World ID')}>Copy</button>
                                    )}
                                </div>
                                <div className="font-medium break-all" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                                    {inWorld && user.location ? user.location.split(":")[0] : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
