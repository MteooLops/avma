'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRedirect() {
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

  return null;
}
