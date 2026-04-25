
    async function checkAuth() {
        try {
    const API_BASE = 'https://your-backend.onrender.com'; // Change to your backend URL

    async function checkAuth() {
        try {
            const res = await fetch(API_BASE + '/api/auth/check', { credentials: 'include' });
            return res.ok;
        } catch {
            return false;
        }
    }

    async function updateHeaderOnLoad() {
        const authenticated = await checkAuth();
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) return;

        if (authenticated) {
            authButtons.innerHTML = `
                <div class="hamburger" onclick="toggleUserMenu()">☰ My Account</div>
                <div class="user-menu" id="userMenu" style="display:none;">
                    <a href="/dashboard">Dashboard</a>
                    <a href="#" onclick="logout()">Logout</a>
                </div>
            `;
        }
    }

    function toggleUserMenu() {
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }

    async function logout() {
        await fetch(API_BASE + '/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/';
    }

    window.addEventListener('load', updateHeaderOnLoad);
