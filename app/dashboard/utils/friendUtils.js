// Utility functions for friend data normalization

export function normalizeFriendStatus(friend) {
    let displayLocation = friend.location || '';
    let displayStatus = friend.status || '';

    if (friend.platform === 'web') displayLocation = 'Web';
    else if (displayLocation === 'private') displayLocation = 'Private';
    else if (displayLocation === 'offline') displayLocation = 'Offline';

    if (displayStatus === 'offline') displayStatus = 'Offline';
    else if (displayStatus === 'ask me') displayStatus = 'Ask Me';
    else if (displayStatus === 'busy') displayStatus = 'Do Not Disturb';
    else if (displayStatus === 'active') displayStatus = 'Online';
    else if (displayStatus === 'join me') displayStatus = 'Join Me';

    return { displayLocation, displayStatus };
}

export function getStatusTone(displayStatus, displayLocation) {
    if (displayLocation.toLowerCase() === 'offline') return 'status-offline';

    switch (displayStatus) {
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
}
