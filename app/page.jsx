'use client';
import AutoRedirect from "./components/AutoRedirect";
import "./globals.css";

export default function Home() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
      <AutoRedirect />
      <h1>VRChat Client</h1>
      <p>Redirecting...</p>
    </div>
  );
}
