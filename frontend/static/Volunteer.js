    let currentNGO = null;

    const API_BASE = 'https://your-backend.onrender.com'; // Change to your backend URL

    async function fetchNGOs(query = '') {
        const url = API_BASE + '/api/ngos' + (query ? `?q=${encodeURIComponent(query)}` : '');
        const res = await fetch(url, { credentials: 'include' });
        const payload = await res.json();
        return res.ok ? payload : [];
    }

    async function checkAuth() {
        try {
            const res = await fetch(API_BASE + '/api/auth/check', { credentials: 'include' });
            return res.ok;
        } catch {
            return false;
        }
    }

    async function searchNGOs() {
        const query = document.getElementById('searchInput').value.trim();
        clearVolunteerMessage();
        currentNGO = null;
        updateSelection();
        const ngos = await fetchNGOs(query);
        displayNGOs(ngos, query);
    }

    function displayNGOs(ngos, query = '') {
        const list = document.getElementById('ngoList');
        list.innerHTML = '';

        if (!ngos.length) {
            const item = document.createElement('div');
            item.className = 'no-results';
            item.textContent = query ? 'Sorry, We could not find this NGO' : 'No NGOs available at the moment.';
            list.appendChild(item);
            return;
        }

        ngos.forEach(ngo => {
            const item = document.createElement('div');
            item.className = 'ngo-card';
            item.innerHTML = `
                <h4>${ngo.name}</h4>
                <p>${ngo.location}</p>
                <p>${ngo.focus}</p>
            `;
            item.onclick = () => selectNGO(ngo);
            list.appendChild(item);
        });
    }

    function selectNGO(ngo) {
        currentNGO = ngo;
        document.getElementById('selectedNgoName').textContent = ngo.name;
        document.getElementById('selectedNgoDetails').textContent = 'These are the skills this NGO is seeking:';
        document.getElementById('skillsNeeded').textContent = ngo.focus;
        document.getElementById('skillsInput').value = '';
        clearVolunteerMessage();
    }

    function updateSelection() {
        const selectedName = document.getElementById('selectedNgoName');
        const selectedDetails = document.getElementById('selectedNgoDetails');
        const skillsNeeded = document.getElementById('skillsNeeded');
        if (!currentNGO) {
            selectedName.textContent = 'Select an NGO to view skill needs';
            selectedDetails.textContent = 'Click any NGO above to see what skills it is looking for.';
            skillsNeeded.textContent = '';
            return;
        }
        selectedName.textContent = currentNGO.name;
        selectedDetails.textContent = 'These are the skills this NGO is seeking:';
        skillsNeeded.textContent = currentNGO.focus;
    }

    async function applyVolunteer() {
        const authenticated = await checkAuth();
        if (!authenticated) {
            showModal();
            return;
        }
        if (!currentNGO) {
            setVolunteerMessage('Please select an NGO first.', true);
            return;
        }
        const skills = document.getElementById('skillsInput').value.trim();
        if (!skills) {
            setVolunteerMessage('Please add your skills before applying.', true);
            return;
        }
        setVolunteerMessage(`Application sent to ${currentNGO.name}. You will be notified about the next steps.`, false);
        document.getElementById('skillsInput').value = '';
    }

    function setVolunteerMessage(message, error = false) {
        const msg = document.getElementById('volunteerMessage');
        msg.textContent = message;
        msg.style.color = error ? '#e53e3e' : '#166534';
    }

    function clearVolunteerMessage() {
        setVolunteerMessage('');
    }

    function showModal() {
        const m = document.getElementById('auth-modal');
        if (m) {
            m.style.display = 'flex';
        }
    }

    function closeModal() {
        const m = document.getElementById('auth-modal');
        if (m) {
            m.style.display = 'none';
        }
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
        await fetch(API_BASE + '/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/';
    }

    window.onload = async function() {
        const ngos = await fetchNGOs();
        displayNGOs(ngos);
        updateHeaderOnLoad();
        updateSelection();

        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        }
    };
