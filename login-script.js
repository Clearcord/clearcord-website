let accessToken;
let ticket;

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    fetch('https://discord.com/api/v9/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password,
            undelete: false,
            captcha_key: null
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to login');
        }
        return response.json();
    })
    .then(data => {
        if (data.mfa) {
            ticket = data.ticket;
            showMFAPopup();
        } else {
            accessToken = data.token;
            localStorage.setItem('accessToken', accessToken);
            window.location.href = 'client.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function submitMFA() {
    const mfaCode = document.getElementById('mfa-code').value;
    fetch('https://discord.com/api/v9/auth/mfa/totp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: mfaCode,
            ticket: ticket
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid 2FA code');
        }
        return response.json();
    })
    .then(data => {
        accessToken = data.token;
        localStorage.setItem('accessToken', accessToken);
        hideMFAPopup();
        window.location.href = 'client.html';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function showMFAPopup() {
    document.getElementById('mfa-popup').style.display = 'block';
}

function hideMFAPopup() {
    document.getElementById('mfa-popup').style.display = 'none';
}