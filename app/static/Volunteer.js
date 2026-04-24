
    let currentNGO = null;

    const ngos = [
        { name: 'Green Earth NGO', location: 'Kolkata' },
        { name: 'Helping Hands', location: 'Delhi' },
        { name: 'Child Care Foundation', location: 'Mumbai' },
    ];

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
            return res.ok;
        } catch {
            return false;
        }
    }

    function searchNGOs() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const filtered = ngos.filter(ngo => ngo.name.toLowerCase().includes(query));
        document.getElementById('volunteerSection').style.display = 'none';
        displayNGOs(filtered);
    }

    function displayNGOs(ngos) {
        const list = document.getElementById('ngoList');
        list.innerHTML = '';
        ngos.forEach(ngo => {
            const item = document.createElement('div');
            item.className = 'ngo-item';
            item.innerHTML = `<h4>${ngo.name}</h4><p>Location: ${ngo.location}</p>`;
            item.onclick = () => selectNGO(ngo);
            list.appendChild(item);
        });
    }

    function selectNGO(ngo) {
        currentNGO = ngo;
        document.getElementById('ngoName').textContent = ngo.name;
        document.getElementById('volunteerSection').style.display = 'block';
    }

    async function applyVolunteerBox() {
        const authenticated = await checkAuth();
        if (!authenticated) {
            showModal();
            return;
        }
    }

    async function applyVolunteer() {
        const authenticated = await checkAuth();
        if (!authenticated) {
            showModal();
            return;
        }

        const skills = document.getElementById('skills').value;
        if (skills.trim()) {
            alert('Application sent to ' + currentNGO.name + '. You will be notified of acceptance/rejection on your dashboard and email.');
        } else {
            alert('Please enlist your skills.');
        }
    }

    // donate box click guard
    async function handleDonateClick(e) {
        e.preventDefault();
        const authenticated = await checkAuth();
        if (!authenticated) {
            showModal();
            return;
        }
        window.location.href = '/donate';
    }

    function showModal() {
        const m = document.getElementById('auth-modal');
        m.style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('auth-modal').style.display = 'none';
    }

    async function updateHeaderOnLoad() {
        const authenticated = await checkAuth();
        const authButtons = document.querySelector('.auth-buttons');

        if (authenticated && authButtons) {
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

    window.onload = function() {
        displayNGOs(ngos);
        updateHeaderOnLoad();

        // attach donate guard to any element with class="donate"
        document.querySelectorAll('.donate').forEach(el => {
            el.addEventListener('click', handleDonateClick);
        });

        // close modal on backdrop click
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        }
    };
