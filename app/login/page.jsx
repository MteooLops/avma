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

    const handleLoginFirstStep = async () => {
        const user = username?.current?.value || '';
        const pass = password.current.value || '';

        if (!user || !pass) {
            setStatus("Por favor completa usuario y contraseña");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user,
                    password: pass
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStoredUsername(user);
                setStoredPassword(pass);
                localStorage.setItem("hasVRChatSession", "true");
                setStatus("");
                router.push("/dashboard");
            } else if (data.requiresTwoFactor) {
                setRequire2fa(true);
                setStoredUsername(user);
                setStoredPassword(pass);
                setStatus("");
            } else {
                setStatus(data.message || "Login fallido");
            }
        } catch (e) {
            console.error(e);
            setStatus("Error en el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSecondStep = async () => {
        const code = twoFactor.current.value;

        if (!code) {
            setStatus("Por favor ingresa el código 2FA");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: storedUsername,
                    password: storedPassword,
                    twoFactorCode: code
                })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("hasVRChatSession", "true");
                setStatus("");
                router.push("/dashboard");
            } else {
                setStatus(data.message || "Código 2FA inválido");
            }
        } catch (e) {
            console.error(e);
            setStatus("Error validando 2FA");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = require2fa ? handleLoginSecondStep : handleLoginFirstStep;

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
                            <h1 className="text-2xl font-semibold mb-2">AVMA</h1>
                            <p className="text-sm muted">Log In with your VRChat Credentials.</p>
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
