'use client';
import React from 'react';

export default function QuickLaunch({ userId, onLaunch, onRefresh, loading }) {
    return (
        <div className="card p-4 fade-in">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Quick Launch</h2>
                <span className="small muted">ID: {userId}</span>
            </div>
            <p className="mt-2 small muted">Start VRChat and return where you left off.</p>
            <div className="mt-4 flex items-center gap-3">
                <button className="btn btn-primary" onClick={onLaunch} aria-label="Launch VRChat">
                    Launch VRChat
                </button>
                <button className="btn" onClick={onRefresh} aria-label="Refresh friends">
                    Refresh friends
                </button>
            </div>
        </div>
    );
}
