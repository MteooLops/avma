'use client';
import React from 'react';

export default function Header({ user, searchTerm, setSearchTerm, onSearch, status, onLogout, loading }) {
    return (
        <header className="sticky top-0 z-10 header-glass">
            <div className="h-16 px-6 flex items-center gap-4 justify-between">
                <div className="flex-1 flex items-center gap-3">
                    <input
                        aria-label="Search worlds or friends"
                        className="input w-full max-w-2xl px-3 py-2 text-sm"
                        placeholder="Search worlds or friends..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn" onClick={onSearch} disabled={loading} aria-label="Search">
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="avatar small">{(user.displayName || user.username || "?").charAt(0).toUpperCase()}</div>
                        <div className="small muted">{user.displayName || user.username}</div>
                    </div>
                    <button className="btn" onClick={onLogout} aria-label="Sign out">
                        Sign out
                    </button>
                </div>
            </div>
            {status && (
                <div className="px-6 pb-3">
                    <div className="card px-3 py-2 small muted">{status}</div>
                </div>
            )}
        </header>
    );
}
