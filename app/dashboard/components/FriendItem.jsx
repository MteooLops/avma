'use client';
import React from 'react';

export default function FriendItem({ f, selectedFriend, onSelect, primaryLabel = 'Details'}) {
    if (f.location === 'private') f.location = 'Private'; 
    if (f.location === 'offline') f.location = 'Offline'; 
    if (f.status === 'offline') f.status = 'Offline'; 
    if (f.status === 'ask me') f.status = 'Ask Me'; 
    if (f.status === 'busy') f.status = 'Do Not Disturb';
    if (f.status === 'active') f.status = 'Online'; 
    if (f.status === 'join me') f.status = 'Join Me';
    if (f.platform === 'web') f.location = 'Web';

    const normalizedStatus = (f.status || '');
    const statusTone = (() => {
        if ((f.location || '').toLowerCase() === 'offline') return 'status-offline';
        switch (normalizedStatus) {
            case 'Offline':
                return 'status-offline';
            case 'Do Not Disturb':
                return 'status-dnd';
            case 'Join Me':
                return 'status-joinme';
            case 'Ask Me':
                return 'status-away';
            case 'Online':
            default:
                return 'status-online';
        }
    })();
    console.log(f);

    return (
        <div key={f.id} id={`f-${f.id}`} className={`flex items-start justify-between p-2 rounded-md ${selectedFriend === f.id ? 'shadow-[inset_0_0_0_2px_rgba(86,96,106,0.12)]' : ''}`} style={{ gap: 12 }}>
            <div className="flex items-start gap-3">
                <img src={f.imageUrl} className="avatar"></img>
                <div style={{ minWidth: 0 }}>
                    <div className="font-medium">{f.displayName || f.username}</div>
                    <div className="small muted flex items-center gap-[5px]">
                        <span className={`status-dot ${statusTone}`} aria-hidden="true" />
                        {/* TODO: hacer una forma de traducir la instancia de un amigo desde una id de mundo a el nombre del mundo (Posiblemente se pueda hacer con la api de vrchat) */}
                        <span>{f.statusDescription || f.status} | {f.location || ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
