
    const ngos = [
        { name: 'Green Earth NGO', location: 'Kolkata', lat: 22.5726, lng: 88.3639 },
        { name: 'Helping Hands', location: 'Delhi', lat: 28.7041, lng: 77.1025 },
        { name: 'Child Care Foundation', location: 'Mumbai', lat: 19.0760, lng: 72.8777 },
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
        const filtered = ngos.filter(ngo =>
            ngo.name.toLowerCase().includes(query) ||
            ngo.location.toLowerCase().includes(query)
        );
        displayNGOs(filtered);
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const coords = `${lat}, ${lng}`;
                navigator.clipboard.writeText(coords).then(() => {
                    alert('Coordinates copied to clipboard: ' + coords);
                    document.getElementById('coordsInput').value = coords;
                });
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    function findNearbyNGOs() {
        const coords = document.getElementById('coordsInput').value.split(',').map(c => parseFloat(c.trim()));
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
            alert('Please enter valid coordinates.');
            return;
        }
        const [userLat, userLng] = coords;
        const nearby = ngos.filter(ngo => getDistance(userLat, userLng, ngo.lat, ngo.lng) <= 5);
        displayNGOs(nearby);
    }

    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLng = deg2rad(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function displayNGOs(ngos) {
        const list = document.getElementById('ngoList');
        list.innerHTML = '';
        ngos.forEach(ngo => {
            const item = document.createElement('div');
            item.className = 'ngo-item';
            item.innerHTML = `<h4>${ngo.name}</h4><p>Location: ${ngo.location}</p>`;
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

    window.onload = function() {
        displayNGOs(ngos);
        updateHeaderOnLoad();
    };
