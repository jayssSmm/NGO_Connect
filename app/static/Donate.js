let currentNGO = null;

async function fetchNGOs(query = '') {
    const url = '/api/ngos' + (query ? `?q=${encodeURIComponent(query)}` : '');
    const res = await fetch(url, { credentials: 'same-origin' });
    const payload = await res.json();

    if (!res.ok) {
        // 404 → { message: "...", ngos: [] }
        return [];
    }

    // 200 → plain list
    return Array.isArray(payload) ? payload : [];
}

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
        return res.ok;
    } catch {
        return false;
    }
}

// ── Search & Location ──────────────────────────────────────────────

function setLocationMessage(text, error = true) {
    const el = document.getElementById('locationMessage');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = error ? '#e53e3e' : '#166534';
}

async function searchNGOs() {
    const query = document.getElementById('searchInput').value.trim();
    setLocationMessage('');
    const ngos = await fetchNGOs(query);
    if (!ngos.length && query) setLocationMessage("Sorry, we can't find this NGO", true);
    displayNGOs(ngos, query);
}

function isValidCoords(raw) {
    const coords = raw.split(',').map(c => parseFloat(c.trim()));
    return coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
}

function getLocation() {
    if (!navigator.geolocation) {
        setLocationMessage('Geolocation is not supported by this browser.', true);
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            document.getElementById('coordsInput').value = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            setLocationMessage('Coordinates captured. Click Find NGOs Near Me.', false);
        },
        () => setLocationMessage('Unable to detect your location. Please enter coordinates.', true)
    );
}

async function findNearbyNGOs() {
    const raw = document.getElementById('coordsInput').value.trim();
    if (!isValidCoords(raw)) { setLocationMessage('Enter correct coordinates.', true); return; }
    const [userLat, userLng] = raw.split(',').map(c => parseFloat(c.trim()));
    const ngos = await fetchNGOs();
    const nearby = ngos.filter(n => n.latitude && n.longitude && getDistance(userLat, userLng, n.latitude, n.longitude) <= 5);
    setLocationMessage(nearby.length ? 'Showing NGOs near your location.' : 'No nearby NGOs found for those coordinates.', !nearby.length);
    displayNGOs(nearby, '');
}

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371, dLat = deg2rad(lat2 - lat1), dLng = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg) { return deg * (Math.PI / 180); }

// ── Display ────────────────────────────────────────────────────────

function displayNGOs(ngos, query = '') {
    const list = document.getElementById('ngoList');
    list.innerHTML = '';

    if (!ngos.length) {
        const div = document.createElement('div');
        div.className = 'no-results';
        div.textContent = query ? "Sorry, we can't find this NGO" : 'No NGOs available at the moment.';
        list.appendChild(div);
        return;
    }

    ngos.forEach(ngo => {
        const item = document.createElement('div');
        item.className = 'ngo-item';
        item.innerHTML = `
            <h4><a href="/ngo/${encodeURIComponent(ngo.ngo_id)}">${ngo.name}</a></h4>
            <p>📍 ${ngo.location}</p>
            <p>${ngo.focus}</p>
        `;
        item.addEventListener('click', () => openPanel(ngo));
        list.appendChild(item);
    });
}

    function selectNGO(ngo) {
        currentNGO = ngo;
        document.getElementById('ngoName').textContent = ngo.name;
        document.getElementById('donationSection').style.display = 'block';
    }

    async function logout() {
        await fetch('/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        window.location.href = '/';
    }

    async function donateMoney() {
        if (!currentNGO) {
            alert('Please select an NGO first.');
            return;
        }

        const amount = document.getElementById('amount').value;
        if (!amount || amount < 1) {
            alert('Minimum donation is 1 INR.');
            return;
        }
        try {
            const res = await fetch('/api/donate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body:  JSON.stringify({
                    ngo_name: currentNGO.name,
                    ngo_id:  currentNGO.ngo_id,   // make sure currentNGO has this field
                    amount:  Number(amount)
                })
            });

            if (!res.ok) {
                alert('Failed to record donation. Please try again.');
                return;
            }
        } catch (err) {
            console.log(err)
            alert('Network error. Please try again.');
            return;
        }

        showRazorpayScanner(currentNGO, amount);
    }

    function showRazorpayScanner(ngo, amount) {
        const scannerCode = `RAZORPAY_QR_CODE_${ngo.name.replace(/\s+/g, '_')}`;
        alert('Razorpay Dummy Scanner for ' + ngo.name + ':\n\n' + scannerCode + '\nAmount: ' + amount + ' INR\n\nAfter scanning and payment, you will receive confirmation.');
        setTimeout(() => processMoneyDonation(ngo, amount), 500);
    }

    async function processMoneyDonation(ngo, amount) {
        const authenticated = await checkAuth();
        let message = `Payment of ${amount} INR sent to ${ngo.name}. `;

        if (authenticated) {
            message += 'Confirmation received on both website and payment app.';
        } else {
            message += 'Confirmation received on payment app.';
        }
        alert(message);
        document.getElementById('amount').value = '';
    }

    async function donateItemsBox() {
        const authenticated = await checkAuth();
        if (!authenticated) {
            showModal();
            return;
        }
    }

    async function donateItems() {
        const authenticated = await checkAuth();
        if (!authenticated) {
            showModal();
            return;
        }

        if (!currentNGO) {
            alert('Please select an NGO first.');
            return;
        }

        const items = document.getElementById('items').value;
        if (items.trim()) {
            alert('Item list sent to ' + currentNGO.name + '. You will be notified of acceptance/rejection on your dashboard and email.');
        } else {
            alert('Please list items to donate.');
        }
    }

function showModal() {
    const m = document.getElementById('auth-modal');
    if (m) m.style.display = 'flex';
}

function closeModal() {
    const m = document.getElementById('auth-modal');
    if (m) m.style.display = 'none';
}

// ── Header ─────────────────────────────────────────────────────────

async function updateHeaderOnLoad() {
    const authenticated = await checkAuth();
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons || !authenticated) return;
    authButtons.innerHTML = `
        <div class="hamburger" onclick="toggleUserMenu()">☰ My Account</div>
        <div class="user-menu" id="userMenu" style="display:none;">
            <a href="/dashboard">Dashboard</a>
            <a href="#" onclick="logout()">Logout</a>
        </div>
    `;
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

async function logout() {
    await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/';
}

// ── Init ───────────────────────────────────────────────────────────

window.onload = async function () {
    const ngos = await fetchNGOs();
    displayNGOs(ngos);
    updateHeaderOnLoad();

        document.getElementById('auth-modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    };
