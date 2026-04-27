    async function fetchNGOs(query = '') {
        const url = '/api/ngos' + (query ? `?q=${encodeURIComponent(query)}` : '');
        const res = await fetch(url, { credentials: 'same-origin' });
        const payload = await res.json();
        if (res.ok) return payload;
        return Array.isArray(payload.ngos) ? payload.ngos : [];
    }

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
            return res.ok;
        } catch {
            return false;
        }
    }

    function setLocationMessage(text, error = true) {
        const message = document.getElementById('locationMessage');
        if (!message) return;
        message.textContent = text || '';
        message.style.color = error ? '#e53e3e' : '#166534';
    }

    function clearLocationMessage() {
        setLocationMessage('');
    }

    async function searchNGOs() {
        const query = document.getElementById('searchInput').value.trim();
        clearLocationMessage();
        const ngos = await fetchNGOs(query);

        if (!ngos.length && query) {
            setLocationMessage("Sorry, we can't find this NGO", true);
        }

        displayNGOs(ngos, query);
    }

    function isValidCoords(raw) {
        const coords = raw.split(',').map(c => parseFloat(c.trim()));
        return coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const coords = `${lat}, ${lng}`;
                document.getElementById('coordsInput').value = coords;
                setLocationMessage('Coordinates captured. Click Find NGOs Near Me.', false);
            }, function() {
                setLocationMessage('Unable to detect your location. Please enter coordinates.', true);
            });
        } else {
            setLocationMessage('Geolocation is not supported by this browser.', true);
        }
    }

    async function findNearbyNGOs() {
        const raw = document.getElementById('coordsInput').value.trim();
        if (!isValidCoords(raw)) {
            setLocationMessage('Enter Correct Coordinate', true);
            return;
        }

        const [userLat, userLng] = raw.split(',').map(c => parseFloat(c.trim()));
        const ngos = await fetchNGOs();
        const nearby = ngos.filter(ngo => ngo.latitude && ngo.longitude && getDistance(userLat, userLng, ngo.latitude, ngo.longitude) <= 5);

        if (!nearby.length) {
            setLocationMessage('No nearby NGOs were found for those coordinates.', true);
        } else {
            setLocationMessage('Showing NGOs near your location.', false);
        }

        displayNGOs(nearby, '');
    }

    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLng = deg2rad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function displayNGOs(ngos, query = '') {
        const list = document.getElementById('ngoList');
        list.innerHTML = '';

        if (!ngos.length) {
            const item = document.createElement('div');
            item.className = 'no-results';
            item.textContent = query ? "Sorry, we can't find this NGO" : 'No NGOs available at the moment.';
            list.appendChild(item);
            return;
        }

        ngos.forEach(ngo => {
            const item = document.createElement('div');
            item.className = 'ngo-item';
            item.innerHTML = `
                <a class="ngo-link" href="/ngo/${encodeURIComponent(ngo.ngo_id)}">
                    <h4>${ngo.name}</h4>
                </a>
                <p>Location: ${ngo.location}</p>
                <p>${ngo.focus}</p>
            `;
            list.appendChild(item);
        });
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

    window.onload = async function() {
        const ngos = await fetchNGOs();
        displayNGOs(ngos);
        updateHeaderOnLoad();
    };
