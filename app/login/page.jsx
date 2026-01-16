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
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <main>
                {status && (
                    <div style={{ marginBottom: "12px", padding: "10px", background: "#eef2ff", border: "1px solid #cfd8ff" }}>
                        {status}
                    </div>
                )}

                {!require2fa && (
                    <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px", maxWidth: "400px", margin: "50px auto" }}>
                        <h2>VRChat Login</h2>
                        <p>Enter your VRChat credentials</p>
                        <input
                            type="text"
                            ref={username}
                            placeholder="Email / Username"
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%", boxSizing: "border-box" }}
                        />
                        <input
                            type="password"
                            ref={password}
                            placeholder="Password"
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%", boxSizing: "border-box" }}
                        />
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            style={{ padding: "10px 20px", cursor: "pointer", width: "100%" }}
                        >
                            {loading ? "Loading..." : "Log In"}
                        </button>
                    </div>
                )}

                {require2fa && (
                    <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px", maxWidth: "400px", margin: "50px auto" }}>
                        <h2>Two-Factor Auth</h2>
                        <p>Enter your 2FA code</p>
                        <input
                            type="text"
                            ref={twoFactor}
                            placeholder="2FA Code"
                            style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%", boxSizing: "border-box" }}
                        />
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            style={{ padding: "10px 20px", cursor: "pointer", width: "100%" }}
                        >
                            {loading ? "Loading..." : "Confirm 2FA"}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
