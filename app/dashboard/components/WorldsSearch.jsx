'use client';
import React, { useState } from 'react';

export default function WorldsSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [worlds, setWorlds] = useState([]);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setStatus('Enter a search term');
            setWorlds([]);
            return;
        }

        try {
            setLoading(true);
            setStatus('Searching...');
            const res = await fetch(`/api/worlds?search=${encodeURIComponent(searchTerm)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            const text = await res.text();
            const data = JSON.parse(text || '{}');
            if (res.ok) {
                const found = data.worlds || [];
                setWorlds(found);
                setStatus(`Worlds found: ${found.length}`);
            } else {
                setWorlds([]);
                setStatus(data.error || 'Error searching worlds');
            }
        } catch (error) {
            setWorlds([]);
            setStatus('Error searching worlds: ' + (error?.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-4 fade-in">
            <h2 className="font-semibold">Search worlds</h2>
            <p className="mt-2 small muted">Examples: Void, Black Cat, Cozy Cafe</p>

            <div className="mt-3 space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                        className="input px-3 py-2 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="World name"
                        aria-label="World name"
                    />
                    <button className="btn" onClick={handleSearch} disabled={loading} aria-label="Search worlds">
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {status && <div className="small muted">{status}</div>}

                <div className="space-y-3">
                    {worlds.length > 0 ? (
                        worlds.map((world) => (
                            <div key={world.id} className="p-3 rounded-md card flex items-center justify-between" role="article" aria-label={`World ${world.name}`}>
                                <div>
                                    <div className="font-medium">{world.name}</div>
                                    <div className="small muted">Author: {world.authorName}</div>
                                </div>
                                <div className="small muted">{world.occupants}/{world.capacity}</div>
                            </div>
                        ))
                    ) : (
                        <div className="small muted">No results yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
