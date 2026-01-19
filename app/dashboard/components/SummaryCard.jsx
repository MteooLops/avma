'use client';
import React from 'react';

export default function SummaryCard({ friendsCount, onRefresh }) {
    return (
        <div className="card p-4 fade-in">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Summary</h2>
                <div className="small muted">Friends: {friendsCount}</div>
            </div>
            <p className="mt-2 small muted">Friends panel is on the right. Use it to see online/offline lists.</p>
            <div className="mt-4 flex items-center gap-3">
                <button className="btn" onClick={onRefresh} aria-label="Refresh friends">Refresh friends</button>
            </div>
        </div>
    );
}
