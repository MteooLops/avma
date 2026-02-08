'use client';
import React, { useState, useEffect } from 'react';

export default function FriendWorlds() {
    const [friendWorlds, setFriendWorlds] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [worldsDetails, setWorldsDetails] = useState({});

    useEffect(() => {
        loadFriendWorlds();
    }, []);

    const loadFriendWorlds = async () => {
        try {
            setLoading(true);
            setStatus('Loading...');

            const res = await fetch("/api/friends", { method: "GET", headers: { "Content-Type": "application/json" } });
            const friends = await res.json();

            console.log(friends)
            // Filter friends that are in public worlds
            const worldsList = friends.friendWorlds.reduce((acc, friend) => {
                const existingWorld = acc.find(w => w.location === friend.location);
                if (existingWorld) {
                    existingWorld.friendCount++;
                } else {
                    acc.push({
                        location: friend.location,
                        friendCount: 1
                    });
                }
                return acc;
            }, []);

            // Fetch details for each world
            const detailsMap = {};
            for (const world of worldsList) {
                try {
                    // Extraer solo el ID base del mundo (antes del ':')
                    const cleanWorldId = world.location.split(':')[0];
                    const worldRes = await fetch(`/api/worlds?id=${cleanWorldId}`);
                    const worldData = await worldRes.json();

                    console.log(worldData)

                    if (worldData.success) {
                        detailsMap[world.location] = worldData.world;
                    }
                } catch (err) {
                    console.error(`Error fetching world ${world.location}:`, err);
                }
            }

            setWorldsDetails(detailsMap);
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
                        friendWorlds.map((world) => {
                            const details = worldsDetails[world.location];
                            return (
                                <div key={details?.name} className="world-result-card flex-shrink-0" role="article" aria-label={`World ${world.location}`}>
                                    <div className="world-result-image bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                                        <img src={details?.imageUrl} />
                                    </div>
                                    <div className="p-3">
                                        <div className="font-medium text-sm">{details?.name || world.location}</div>
                                        <div className="small muted">{world.friendCount} friend{world.friendCount !== 1 ? 's' : ''}</div>
                                        <div className="small muted mt-1">
                                            {details?.author && `by ${details.author}`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="small muted">No friends in public worlds</div>
                    )}
                </div>
            </div>
        </div>
    );
}