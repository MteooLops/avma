'use client';
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";

export default function LoginPage() {
    const router = useRouter();
    const username = useRef("");
    const password = useRef("");
    const twoFactor = useRef("");
    const [require2fa, setRequire2fa] = useState(false);
    const [storedUsername, setStoredUsername] = useState("");
    const [storedPassword, setStoredPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Redirect if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const hasSession = localStorage.getItem("hasVRChatSession");
            if (!hasSession) return;

            try {
                const res = await fetch("/api/auth", { method: "GET" });
                if (res.ok) {
                    router.push("/dashboard");
                }
            } catch (err) {
                // Silencioso
            }
        };
        checkSession();
    }, [router]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            if (!require2fa && twoFactor.current) {
                twoFactor.current.value = "";
            }
            const user_input = username.current?.value?.trim();
            const pass_input = password.current?.value || "";
            const two_factor_input = twoFactor.current?.value?.trim();

            if (!require2fa) {
                if (!user_input || !pass_input.trim()) {
                    setStatus("Complete email/username and password");
                    return;
                }
                setStoredUsername(user_input);
                setStoredPassword(pass_input);
            }

            if (require2fa) {
                if (!two_factor_input) {
                    setStatus("Enter the 2FA code");
                    return;
                }
            }

            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: require2fa ? storedUsername : user_input,
                    password: require2fa ? storedPassword : pass_input,
                    twoFactorCode: require2fa ? (two_factor_input || undefined) : undefined,
                })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Invalid response:", text);
                setStatus("Invalid server response");
                return;
            }

            console.log("Auth response status:", res.status, "data:", data);

            if (res.ok) {
                setRequire2fa(false);
                setStoredUsername("");
                setStoredPassword("");
                if (username.current) username.current.value = "";
                if (password.current) password.current.value = "";
                if (twoFactor.current) twoFactor.current.value = "";
                setStatus("Login successful");
                localStorage.setItem("hasVRChatSession", "true");
                router.push("/dashboard");
            } else {
                const needs2fa = data?.require2fa;
                const looksLike2fa = (!needs2fa && res.status === 401 && !require2fa);

                if (needs2fa || looksLike2fa) {
                    setRequire2fa(true);
                    setStatus("Enter the 2FA code and confirm");
                    return;
                }

                console.error("Login failed:", data.error);
                setStatus(data?.error || "Authentication error");
                // Clear password on failed attempt
                if (password.current) password.current.value = "";
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setStatus("Connection error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-gray-200 p-4">
            <main className="w-full max-w-md">
                {status && (
                    <div className="card px-4 py-3 mb-6 text-sm muted fade-in">
                        {status}
                    </div>
                )}

                {!require2fa && (
                    <div className="card p-8 space-y-6 fade-in">
                        <div>
                            <h1 className="text-2xl font-semibold mb-2">VRChat Login</h1>
                            <p className="text-sm muted">Enter your VRChat credentials</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                ref={username}
                                placeholder="Email / Username"
                                className="input w-full px-4 py-2 text-sm"
                            />
                            <input
                                type="password"
                                ref={password}
                                placeholder="Password"
                                className="input w-full px-4 py-2 text-sm"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="btn-primary w-full py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Loading..." : "Log In"}
                        </button>
                    </div>
                )}

                {require2fa && (
                    <div className="card p-8 space-y-6 fade-in">
                        <div>
                            <h1 className="text-2xl font-semibold mb-2">Two-Factor Authentication</h1>
                            <p className="text-sm muted">Enter your 2FA code</p>
                        </div>

                        <div>
                            <input
                                type="text"
                                ref={twoFactor}
                                placeholder="2FA Code"
                                className="input w-full px-4 py-2 text-sm"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="btn-primary w-full py-2 text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Loading..." : "Confirm 2FA"}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
