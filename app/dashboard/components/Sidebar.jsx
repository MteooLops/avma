'use client';
import React from 'react';

export default function Sidebar() {
    return (
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
                    { label: 'Home', href: '/dashboard' },
                    { label: 'Friends', href: '/dashboard' },
                    { label: 'Worlds', href: '/dashboard' },
                    { label: 'Library', href: '/dashboard' },
                    { label: 'Settings', href: '/dashboard' },
                ].map((item) => (
                    <a key={item.label} href={item.href} className="nav-item flex items-center gap-3 small muted">
                        <div className="w-9 h-9 center card"> </div>
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
}
