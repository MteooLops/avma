'use client';
import React from 'react';
import Image from 'next/image';

export default function Sidebar({ user, onLogout, loading }) {
    const userLabel = user?.displayName || user?.username || 'User';

    const navItems = [
        { label: 'Home', href: '/dashboard', icon: '/icons/home.svg' },
        { label: 'Worlds', href: '/dashboard/worlds', icon: '/icons/worlds.svg' },
        { label: 'Settings', href: '/dashboard/settings', icon: '/icons/settings.svg' },
    ];

    console.log(user)

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 sidebar p-3">
            {/* User card */}
            <div className="card p-3 fade-in w-full">
                <div className="flex items-center gap-3">
                    <img
                        src={user.userIcon || user.currentAvatarImageUrl}
                        className="avatar w-12 h-12 rounded-lg flex-shrink-0"
                        alt={userLabel}
                    />
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate" title={userLabel}>
                            {userLabel}
                        </div>
                        <div className="text-xs muted truncate" title={user.statusDescription}>{user.statusDescription}</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="mt-4 space-y-2">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="nav-item flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition small muted"
                    >
                        <span className="text-gray-300 w-9 h-9 flex items-center justify-center rounded-md bg-gray-800 bg-opacity-50 flex-shrink-0">
                            <Image
                                src={item.icon}
                                alt={item.label}
                                width={20}
                                height={20}
                            />
                        </span>
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>

            {/* Sign out button at bottom */}
            <div className="absolute bottom-3 left-3 right-3">
                <button
                    onClick={onLogout}
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-md transition"
                >
                    {loading ? 'Signing out...' : 'Sign out'}
                </button>
            </div>
        </aside>
    );
}
