
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const feedback = document.getElementById('messageFeedback');
        feedback.textContent = '';
        feedback.style.color = '#111827';

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            if (!message) {
                feedback.textContent = 'Please give your message first.';
            } else {
                feedback.textContent = 'Please fill in all fields before sending your message.';
            }
            feedback.style.color = '#d14343';
            return;
        }

        try {
            const res = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });

            const data = await res.json();
            if (res.ok) {
                feedback.textContent = data.message || 'Your message has been sent successfully.';
                feedback.style.color = '#166534';
                document.getElementById('contactForm').reset();
            } else {
                feedback.textContent = data.error || 'Failed to send your message. Please try again.';
                feedback.style.color = '#d14343';
            }
        } catch (error) {
            feedback.textContent = 'Unable to send message right now. Please try again later.';
            feedback.style.color = '#d14343';
        }
    });

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
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
        await fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        window.location.href = '/';
    }

    window.addEventListener('load', updateHeaderOnLoad);
