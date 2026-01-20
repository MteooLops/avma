'use client';
import React, { useState, useEffect } from 'react';

export default function FriendWorlds() {
    const [friendWorlds, setFriendWorlds] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFriendWorlds();
    }, []);

    const loadFriendWorlds = async () => {
        try {
            setLoading(true);
            setStatus('Loading...');

            const res = await fetch("/api/friends", { method: "GET", headers: { "Content-Type": "application/json" } });
            const friends = await res.json();

            if (!Array.isArray(friends)) {
                setStatus('No friends found');
                setFriendWorlds([]);
                return;
            }

            // Filter friends that are in public worlds
            const worldsMap = {};
            friends.forEach(friend => {
                if (friend.location && friend.location !== "private" || "offline") {
                    if (!worldsMap[friend.location]) {
                        worldsMap[friend.location] = [];
                    }
                    worldsMap[friend.location].push(friend);
                }
            });

            const worldsList = Object.entries(worldsMap).map(([worldId, friendsInWorld]) => ({
                worldId,
                friendCount: friendsInWorld.length,
                friends: friendsInWorld,
            })).sort((a, b) => b.friendCount - a.friendCount);

            setFriendWorlds(worldsList);
            setStatus(worldsList.length > 0 ? `Worlds found: ${worldsList.length}` : 'No friends in public worlds');
        } catch (error) {
            setStatus('Error loading worlds: ' + (error?.message || error));
            setFriendWorlds([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="worlds-search-card p-4 fade-in">
            <h2 className="font-semibold">Friend Worlds</h2>
            <p className="mt-2 small muted">Worlds where your friends are</p>

            <div className="mt-3 space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                        className="input px-3 py-2 text-sm"
                        type="text"
                        placeholder="Filter worlds..."
                        aria-label="Filter worlds"
                        disabled
                    />
                    <button
                        className="btn"
                        onClick={loadFriendWorlds}
                        disabled={loading}
                        aria-label="Refresh friend worlds"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {status && <div className="small muted">{status}</div>}

                <div className="flex flex-row gap-3 mt-2 overflow-x-auto pb-2">
                    {friendWorlds.length > 0 ? (
                        friendWorlds.map((world) => (
                            <div key={world.worldId} className="world-result-card flex-shrink-0" role="article" aria-label={`World ${world.worldId}`}>
                                <div className="world-result-image bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                                    {world.friendCount}
                                </div>
                                <div className="p-3">
                                    <div className="font-medium text-sm">{world.worldId}</div>
                                    <div className="small muted">{world.friendCount} friend{world.friendCount !== 1 ? 's' : ''}</div>
                                    <div className="small muted mt-1">
                                        {world.friends.slice(0, 2).map(f => f.displayName || f.username).join(', ')}
                                        {world.friendCount > 2 ? ` +${world.friendCount - 2}` : ''}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="small muted">No friends in public worlds</div>
                    )}
                </div>
            </div>
        </div>
    );
}
