'use client';
import React from 'react';

export default function WorldsSearch({ searchTerm, setSearchTerm, onSearch, worlds = [], loading }) {
    return (
        <div className="card p-4 fade-in">
            <h2 className="font-semibold">Search worlds</h2>
            <p className="mt-2 small muted">Examples: Void, Black Cat, Cozy Cafe</p>

            <div className="mt-3 space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input className="input px-3 py-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="World name" />
                    <button className="btn" onClick={onSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                </div>

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
