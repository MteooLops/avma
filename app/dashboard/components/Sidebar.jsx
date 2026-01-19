'use client';
import React from 'react';

export default function Sidebar({ user }) {
    const userInitial = (user?.displayName || user?.username || '?').charAt(0).toUpperCase();
    const userLabel = user?.displayName || user?.username || 'User';

    return (
        <aside className="fixed top-0 left-0 h-screen sidebar p-3">
            <div className="card p-3 fade-in">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="avatar">{userInitial}</div>
                        <div className="small muted" aria-label="Current user">{userLabel}</div>
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
