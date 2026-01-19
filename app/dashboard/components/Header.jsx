'use client';
import React from 'react';

export default function Header({ status, onLogout, loading }) {
    return (
        <header className="sticky top-0 z-10 header-glass">
            <div className="h-16 px-6 flex items-center justify-end">
                <button className="btn" onClick={onLogout} aria-label="Sign out" disabled={loading}>
                    {loading ? 'Working...' : 'Sign out'}
                </button>
            </div>
            {status && (
                <div className="px-6 pb-3">
                    <div className="card px-3 py-2 small muted">{status}</div>
                </div>
            )}
        </header>
    );
}
