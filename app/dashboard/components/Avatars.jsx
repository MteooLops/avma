'use client';
import React from 'react';

export default function Stats({ user = {} }) {
    return (
        <div className="stats-card p-6 fade-in flex flex-col">
            <h2 className="font-semibold text-lg mb-6">Avatars</h2>
            
            <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 auto-rows-max">
                    
                </div>
            </div>
        </div>
    );
}
