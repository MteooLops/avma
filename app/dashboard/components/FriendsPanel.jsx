'use client';
import React, { useRef } from 'react';
import FriendItem from './FriendItem';

export default function FriendsPanel({ friends, selectedFriend, setSelectedFriend, onlineOpen, setOnlineOpen, webOpen, setWebOpen, offlineOpen, setOfflineOpen }) {
    const onlineListRef = useRef(null);
    const webListRef = useRef(null);
    const offlineListRef = useRef(null);

    const onlineFriends = friends?.onlineFriends || [];
    const webFriends = friends?.webFriends || [];
    const offlineFriends = friends?.offlineFriends || [];

    const handleSelectFriend = (f) => {
        setSelectedFriend(f.id);
        setTimeout(() => {
            const el = document.querySelector(`#f-${f.id}`);
            if (el) el.scrollIntoView({ block: 'center' });
        }, 120);
    };

    return (
        <aside
            aria-hidden={false}
            className="fixed top-0 right-0 h-screen"
            style={{
                width: 360,
                padding: 16,
                boxSizing: "border-box",
                zIndex: 40,
            }}
        >
            <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="small muted">Friends</div>
                        <div className="font-semibold">Contacts</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {onlineFriends.length >= 0 && (<div className="small muted">Playing: {onlineFriends.length}</div>)}
                        {webFriends.length >= 0 && (<div className="small muted">Web: {webFriends.length}</div>)}
                        {offlineFriends.length >= 0 && (<div className="small muted">Offline: {offlineFriends.length}</div>)}
                        {(friends?.totalCount ?? onlineFriends.length + offlineFriends.length) >= 0 && (
                            <div className="small muted">Total: {friends?.totalCount ?? onlineFriends.length + offlineFriends.length}</div>
                        )}
                    </div>
                </div>

                <div className="card sidebar p-3" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* Playing section */}
                    <div className="flex items-center justify-between">
                        <div className="small muted">Playing</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div className="small muted">{onlineFriends.length}</div>
                            <button className="btn" onClick={() => setOnlineOpen(!onlineOpen)} aria-expanded={onlineOpen} aria-label={onlineOpen ? 'Collapse playing' : 'Expand playing'}>
                                {onlineOpen ? '−' : '+'}
                            </button>
                        </div>
                    </div>

                    <div ref={onlineListRef} style={{ overflowY: 'auto', paddingRight: 6, marginTop: 8 }}>
                        {onlineOpen ? (
                            onlineFriends.length > 0 ? (
                                onlineFriends.map((f) => (
                                    <FriendItem key={f.id} f={f} selectedFriend={selectedFriend} onSelect={handleSelectFriend} primaryLabel="Details" secondaryLabel="Invite" />
                                ))
                            ) : (
                                <div className="small muted">No friends playing</div>
                            )
                        ) : null}
                    </div>

                    <hr className="my-3" />

                    {/* Web section */}
                    <div className="flex items-center justify-between">
                        <div className="small muted">Web</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div className="small muted">{webFriends.length}</div>
                            <button className="btn" onClick={() => setWebOpen(!webOpen)} aria-expanded={webOpen} aria-label={webOpen ? 'Collapse web' : 'Expand web'}>
                                {webOpen ? '−' : '+'}
                            </button>
                        </div>
                    </div>

                    <div ref={webListRef} style={{ overflowY: 'auto', paddingRight: 6, marginTop: 8 }}>
                        {webOpen ? (
                            webFriends.length > 0 ? (
                                webFriends.map((f) => (
                                    <FriendItem key={f.id} f={f} selectedFriend={selectedFriend} onSelect={handleSelectFriend} primaryLabel="Details" secondaryLabel="Message" />
                                ))
                            ) : (
                                <div className="small muted">No friends on web</div>
                            )
                        ) : null}
                    </div>

                    <hr className="my-3" />

                    {/* Offline section */}
                    <div className="flex items-center justify-between">
                        <div className="small muted">Offline</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div className="small muted">{offlineFriends.length}</div>
                            <button className="btn" onClick={() => setOfflineOpen(!offlineOpen)} aria-expanded={offlineOpen} aria-label={offlineOpen ? 'Collapse offline' : 'Expand offline'}>
                                {offlineOpen ? '−' : '+'}
                            </button>
                        </div>
                    </div>

                    <div ref={offlineListRef} style={{ overflowY: 'auto', paddingRight: 6, marginTop: 8 }}>
                        {offlineOpen ? (
                            offlineFriends.length > 0 ? (
                                offlineFriends.map((f) => (
                                    <FriendItem key={f.id} f={f} selectedFriend={selectedFriend} onSelect={handleSelectFriend} primaryLabel="Details" secondaryLabel="Message" />
                                ))
                            ) : (
                                <div className="small muted">No offline friends</div>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </aside>
    );
}
