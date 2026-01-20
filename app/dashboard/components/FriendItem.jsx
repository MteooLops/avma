'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeFriendStatus, getStatusTone } from '../utils/friendUtils';

export default function FriendItem({ f, selectedFriend, onSelect, primaryLabel = 'Details' }) {
    const router = useRouter();
    const [worldName, setWorldName] = useState(null);
    const [loadingWorld, setLoadingWorld] = useState(false);

    const { displayLocation, displayStatus } = normalizeFriendStatus(f);
    const statusTone = getStatusTone(displayStatus, displayLocation);

    // Extract world ID from location (format: worldId:instanceId~region)
    useEffect(() => {
        if (f.location && f.location !== 'private' && f.location !== 'offline') {
            const worldId = f.location.split(':')[0];
            if (worldId) {
                setLoadingWorld(true);
                fetch(`/api/worlds/${worldId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.data?.name) {
                            setWorldName(data.data.name);
                        }
                    })
                    .catch(err => console.error('Error fetching world:', err))
                    .finally(() => setLoadingWorld(false));
            }
        }
    }, [f.location]);

    const handleClick = () => {
        // Cache current friend data in localStorage for profile page
        const cachedFriends = localStorage.getItem('vrchat_friends');
        let friendsData = {};

        if (cachedFriends) {
            friendsData = JSON.parse(cachedFriends);
        }

        // Ensure friend is in cache
        if (!friendsData.onlineFriends) friendsData.onlineFriends = [];
        if (!friendsData.webFriends) friendsData.webFriends = [];
        if (!friendsData.offlineFriends) friendsData.offlineFriends = [];

        // Add friend to appropriate list if not already there
        const allLists = [friendsData.onlineFriends, friendsData.webFriends, friendsData.offlineFriends];
        const existsInCache = allLists.some(list => list.some(friend => friend.id === f.id));

        if (!existsInCache) {
            if (f.platform === 'web') {
                friendsData.webFriends.push(f);
            } else if (f.location === 'offline') {
                friendsData.offlineFriends.push(f);
            } else {
                friendsData.onlineFriends.push(f);
            }
            localStorage.setItem('vrchat_friends', JSON.stringify(friendsData));
        }

        // Call original onSelect handler if provided
        onSelect?.(f);

        // Navigate to profile page
        router.push(`/dashboard/profile/${f.id}`);
    };

    return (
        <div
            key={f.id}
            id={`f-${f.id}`}
            className={`flex items-start justify-between p-2 rounded-md cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.02)] hover:shadow-md ${selectedFriend === f.id ? 'shadow-[inset_0_0_0_2px_rgba(86,96,106,0.12)]' : ''}`}
            style={{ gap: 12 }}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <img src={f.imageUrl} alt={f.displayName || f.username || 'Friend avatar'} className="avatar" />
                <div style={{ minWidth: 0 }}>
                    <div className="font-medium">{f.displayName || f.username}</div>
                    <div className="small muted flex items-center gap-1.25">
                        <span className={`status-dot ${statusTone}`} aria-hidden="true" />
                        <span>{f.statusDescription || displayStatus}</span>
                    </div>
                    {worldName && (
                        <div style={{ marginTop: 4 }}>
                            <div className="font-medium text-sm">{worldName}</div>
                            <div className="small muted" style={{ fontSize: '0.75rem', color: 'rgba(139, 150, 161, 0.7)' }}>
                                {f.location?.split(':')[0]}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
