'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../../../globals.css';
import Sidebar from '../../components/Sidebar';
import FriendsPanel from '../../components/FriendsPanel';
import Header from '../../components/Header';
import { normalizeFriendStatus, getStatusTone } from '../../utils/friendUtils';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [friend, setFriend] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [worldName, setWorldName] = useState(null);
    const [worldLoading, setWorldLoading] = useState(false);

    // friends panel state
    const [onlineOpen, setOnlineOpen] = useState(true);
    const [webOpen, setWebOpen] = useState(false);
    const [offlineOpen, setOfflineOpen] = useState(false);


    useEffect(() => {
        const initializePage = async () => {
            const hasSession = localStorage.getItem('hasVRChatSession');
            if (!hasSession) return router.push('/login');

            try {
                // Get user session
                const res = await fetch('/api/auth', { method: 'GET' });
                if (!res.ok) {
                    localStorage.removeItem('hasVRChatSession');
                    return router.push('/login');
                }
                const data = await res.json();
                if (data?.user) {
                    setUser(data.user);
                }

                // Load friends from cache and API
                const cachedFriends = localStorage.getItem('vrchat_friends');
                if (cachedFriends) {
                    const friendsData = JSON.parse(cachedFriends);
                    setFriends(friendsData);

                    const allFriends = [
                        ...(friendsData.onlineFriends || []),
                        ...(friendsData.webFriends || []),
                        ...(friendsData.offlineFriends || [])
                    ];
                    const foundFriend = allFriends.find(f => f.id === params.id);
                    setFriend(foundFriend || null);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };
        initializePage();
    }, [params.id, router]);

    // Keep world name in sync when friend's location changes
    useEffect(() => {
        if (!friend) return;
        if (friend.location && friend.location !== 'private' && friend.location !== 'offline') {
            const worldId = friend.location.split(':')[0];
            if (!worldId) return;
            setWorldLoading(true);
            fetch(`/api/worlds/${worldId}`)
                .then(res => res.json())
                .then(data => {
                    if (data?.success && data.data?.name) {
                        setWorldName(data.data.name);
                    } else {
                        setWorldName(null);
                    }
                    setWorldLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching world name:', err);
                    setWorldName(null);
                    setWorldLoading(false);
                });
        } else {
            setWorldName(null);
            setWorldLoading(false);
        }
    }, [friend?.location]);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await fetch('/api/auth', { method: 'DELETE' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('hasVRChatSession');
            router.push('/login');
        }
    };

    const handleInviteMe = async () => {
        try {
            // Parse world ID and instance ID from friend.location (format: worldId:instanceId~region(someConfig))
            if (!friend.location || friend.location === 'private' || friend.location === 'offline') {
                setStatus('Cannot invite: friend is not in a joinable location');
                return;
            }

            const locationParts = friend.location.split(':');
            const worldId = locationParts[0];
            const instanceId = locationParts[1]?.split('~')[0]; // Remove region config

            if (!worldId || !instanceId) {
                setStatus('Cannot parse friend location');
                return;
            }

            setStatus('Sending invite...');
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ worldId, instanceId })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Invited myself successfully!');
            } else {
                setStatus(`Failed to invite: ${data.error}`);
            }
        } catch (error) {
            setStatus('Error sending invite');
            console.error('Invite error:', error);
        }
    };

    if (!user || !friend) {
        return null; // Don't render anything while loading
    }

    const { displayLocation, displayStatus } = normalizeFriendStatus(friend);
    const inWorld = Boolean(friend.location && friend.location !== 'private' && friend.location !== 'offline');
    const locationText = inWorld ? (worldName || 'Loading world...') : displayLocation;
    const statusTone = getStatusTone(displayStatus, displayLocation);

    if (friend.platform === 'Standalonewindows') friend.platform = 'PC / PCVR';

    return (
        <div className="min-h-screen text-gray-200">
            {/* Left sidebar */}
            <Sidebar user={user} />

            {/* Right friends panel */}
            <FriendsPanel
                friends={friends}
                selectedFriend={selectedFriend}
                setSelectedFriend={setSelectedFriend}
                onlineOpen={onlineOpen}
                setOnlineOpen={setOnlineOpen}
                webOpen={webOpen}
                setWebOpen={setWebOpen}
                offlineOpen={offlineOpen}
                setOfflineOpen={setOfflineOpen}
            />

            {/* Main content - add right padding for friends panel */}
            <div className="pl-28 lg:pl-64" style={{ paddingRight: 416 }}>
                <Header status={status} onLogout={handleLogout} loading={loading} />

                <main className="p-6 space-y-6 pb-12">
                    {/* Header with back button */}
                    <div>
                        <button className="btn" onClick={() => router.push('/dashboard')}>
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Profile Header Card */}
                    <div className="card p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar Section */}
                            <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                                <img
                                    src={friend.imageUrl || friend.currentAvatarImageUrl}
                                    alt={friend.displayName || friend.username}
                                    className="w-40 h-40 rounded-xl object-cover shadow-lg"
                                />
                                <div className="flex items-center gap-2 mt-4">
                                    <span className={`status-dot ${statusTone}`} aria-hidden="true" />
                                    <span className="small font-medium">{displayStatus}</span>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">
                                    {friend.displayName || friend.username}
                                </h1>
                                <div className="small muted mb-6">@{friend.username}</div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {friend.location !== 'private' && friend.location !== 'offline' && (
                                        <button
                                            onClick={() => window.location.href = 'vrchat://launch?ref=vrchat.com&id=' + friend.location}
                                            className="btn px-4 py-2"
                                        >
                                            Join
                                        </button>
                                    )}
                                    {friend.location !== 'private' && friend.location !== 'offline' && (
                                        <button
                                            onClick={handleInviteMe}
                                            className="btn px-4 py-2"
                                            disabled={loading}
                                        >
                                            Invite Me
                                        </button>
                                    )}

                                </div>

                                {/* Bio Section */}
                                {friend.bio && (
                                    <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="small muted mb-2">Bio</div>
                                        <div className="font-medium">{friend.bio}</div>
                                    </div>
                                )}

                                {/* Status Message */}
                                {friend.statusDescription && (
                                    <div className="mb-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="small muted mb-2">Status Message</div>
                                        <div className="font-medium">{friend.statusDescription}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div className="card p-5">
                            <div className="small muted mb-2">Location</div>
                            <div className="font-semibold text-lg">{locationText}</div>
                        </div>

                        <div className="card p-5">
                            <div className="small muted mb-2">Platform</div>
                            <div className="font-semibold text-lg capitalize">{friend.platform || 'Unknown'}</div>
                        </div>

                        {friend.friendKey && (
                            <div className="card p-5">
                                <div className="small muted mb-2">Friends Since</div>
                                <div className="font-semibold text-lg">{new Date(friend.friendKey.split(':')[1] || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        )}

                        <div className="card p-5">
                            <div className="small muted mb-2">Status</div>
                            <div className="flex items-center gap-2">
                                <span className={`status-dot ${statusTone}`} aria-hidden="true" />
                                <span className="font-semibold text-lg">{displayStatus}</span>
                            </div>
                        </div>
                    </div>

                    {/* World Info - Full Width */}
                    {friend.location && friend.location !== 'offline' && friend.location !== 'private' && (
                        <div className="card p-6">
                            <h2 className="font-semibold text-xl mb-4">Current World</h2>
                            <div className="space-y-3">
                                {worldName && (
                                    <div>
                                        <div className="small muted mb-1">World</div>
                                        <div className="font-medium text-lg">{worldName}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="small muted mb-1">Instance ID</div>
                                    <div className="font-medium break-all p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {friend.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Stats */}
                    <div className="flex justify-center gap-4 w-full">
                        <div className="card p-4 text-center flex-1 max-w-xs">
                            <div className="small muted mb-1">User ID</div>
                            <div className="font-medium text-xs break-all">{friend.id}</div>
                        </div>

                        <div className="card p-4 text-center flex-1 max-w-xs">
                            <div className="small muted mb-1">Last Platform</div>
                            <div className="font-semibold capitalize">{friend.last_platform || friend.platform || 'N/A'}</div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
