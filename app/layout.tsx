import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const keywords = ['VRChat', 'Manager App', 'AVMA', 'avma', 'VRChat home', 'VRChat Avatars', 'VRC', 'vrc', 'Worlds', 'world search', 'friend manager']

export const metadata: Metadata = {
  title: "AVMA",
  description: "Another VRChat Manager App.",
  keywords: keywords,
  creator: "Mteoo",
  //robots: '',

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
