'use client';
import React from 'react';

export default function QuickLaunch({ userId, onLaunch, onRefresh, loading }) {
    return (
        <div className="quick-launch-card p-6 fade-in flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg">Quick Launch</h2>
                <span className="small muted">ID: {userId}</span>
            </div>
            <p className="small muted mb-6">Start VRChat and return where you left off.</p>
            
            <div className="flex flex-col gap-4 flex-1">
                <button className="btn btn-primary btn-lg" onClick={onLaunch} aria-label="Launch VRChat">
                    <span className="text-base font-medium">Launch VRChat</span>
                </button>
                <button className="btn btn-lg" onClick={onRefresh} aria-label="Refresh friends">
                    <span className="text-base font-medium">Refresh Friends</span>
                </button>
            </div>
        </div>
    );
}
