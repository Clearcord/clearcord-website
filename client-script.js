let darkMode = false;
let accessToken = localStorage.getItem('accessToken');

function toggleDarkMode() {
    const darkModeIcon = document.getElementById('dark-mode-icon');
    if (darkMode) {
        document.body.classList.remove('dark-mode');
        darkModeIcon.src = 'icons/dark.svg';
    } else {
        document.body.classList.add('dark-mode');
        darkModeIcon.src = 'icons/light.svg';
    }
    darkMode = !darkMode;
}

document.addEventListener('DOMContentLoaded', (event) => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        alert('No access token found. Redirecting to login page.');
        window.location.href = 'login.html';
        return;
    }

    fetch('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        const userInfo = document.getElementById('user-info');
        userInfo.innerHTML = `
            <p>Username: ${data.username}</p>
            <p>Email: ${data.email}</p>
            <p>Avatar: <img src="https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png" alt="Avatar"></p>
        `;
    })
    .catch(error => {
        console.error('Error:', error);
    });

    fetch('https://discord.com/api/users/@me/relationships', {
        headers: {
            Authorization: `${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch friends list');
        }
        return response.json();
    })
    .then(friends => {
        const friendsList = document.getElementById('friends-list');
        friends.forEach(friend => {
            const listItem = document.createElement('li');
            const avatarUrl = friend.user.avatar
                ? `https://cdn.discordapp.com/avatars/${friend.user.id}/${friend.user.avatar}.png`
                : 'https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png';
            const displayName = friend.nickname || friend.user.global_name;
            listItem.innerHTML = `
                <img src="${avatarUrl}" alt="Avatar">
                <span>${displayName}</span>
            `;
            listItem.addEventListener('click', () => loadMessages(friend.user.id));
            friendsList.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

    fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            Authorization: `${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch server list');
        }
        return response.json();
    })
    .then(servers => {
        const serverSidebar = document.getElementById('server-sidebar');
        servers.forEach(server => {
            const serverIconUrl = server.icon 
                ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`
                : createServerIcon(server.name);
            const serverIcon = document.createElement('img');
            serverIcon.src = serverIconUrl;
            serverIcon.alt = server.name;
            serverSidebar.appendChild(serverIcon);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function createServerIcon(serverName) {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const context = canvas.getContext('2d');

    context.fillStyle = getRandomColor();
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#FFFFFF';
    context.font = '10px Segoe UI';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const initials = serverName.split(' ').map(word => word.charAt(0)).join('').toUpperCase();

    context.fillText(initials, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function loadMessages(friendId) {
    fetch(`https://discord.com/api/users/@me/channels`, {
        headers: {
            Authorization: `${accessToken}`
        },
        method: 'POST',
        body: JSON.stringify({
            recipient_id: friendId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch channel ID');
        }
        return response.json();
    })
    .then(channel => {
        return fetch(`https://discord.com/api/channels/${channel.id}/messages`, {
            headers: {
                Authorization: `${accessToken}`
            }
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        return response.json();
    })
    .then(messages => {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.innerHTML = `
                <img src="https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png" alt="Avatar">
                <div>
                    <p><strong>${message.author.username}</strong></p>
                    <p>${message.content}</p>
                </div>
            `;
            mainContent.appendChild(messageDiv);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
