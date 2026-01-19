'use client';
import React from 'react';

export default function FriendItem({ f, selectedFriend, onSelect, primaryLabel = 'Details', secondaryLabel = 'Message' }) {
    return (
        <div key={f.id} id={`f-${f.id}`} className={`flex items-start justify-between p-2 rounded-md ${selectedFriend === f.id ? 'shadow-[inset_0_0_0_2px_rgba(86,96,106,0.12)]' : ''}`} style={{ gap: 12 }}>
            <div className="flex items-start gap-3">
                <div className="avatar">{((f.displayName || f.username || '?').charAt(0) || 'U').toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                    <div className="font-medium">{f.displayName || f.username}</div>
                    <div className="small muted flex items-center gap-2">
                        <span className={`status-dot ${f.location === 'offline' ? 'status-offline' : 'status-online'}`} aria-hidden="true" />
                        <span>{f.status || (f.location || '')}</span>
                    </div>
                    {selectedFriend === f.id && (
                        <div className="mt-2 small muted">More info: last seen, current world, or custom message.</div>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => onSelect(f)}>{primaryLabel}</button>
                <button className="btn">{secondaryLabel}</button>
            </div>
        </div>
    );
}
