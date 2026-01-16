'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const hasSession = localStorage.getItem("hasVRChatSession");
    if (hasSession) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
      <h1>VRChat Client</h1>
      <p>Redirecting...</p>
    </div>
  );
}