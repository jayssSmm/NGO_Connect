let currentNGO = null;

// ── NGO Fetching ──────────────────────────────────────────────

async function fetchNGOs(query = '') {
    const url = '/api/ngos' + (query ? `?q=${encodeURIComponent(query)}` : '');
    const res = await fetch(url, { credentials: 'same-origin' });
    const payload = await res.json();
    return res.ok ? (Array.isArray(payload) ? payload : []) : [];
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
    displayNGOs(ngos, query);
}

function getLocation() {
    if (!navigator.geolocation) {
        setLocationMessage('Geolocation is not supported.', true);
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            document.getElementById('coordsInput').value = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            setLocationMessage('Coordinates captured. Click Find.', false);
        },
        () => setLocationMessage('Unable to detect location.', true)
    );
}

async function findNearbyNGOs() {
    const raw = document.getElementById('coordsInput').value.trim();
    if (!raw.includes(',')) { setLocationMessage('Enter correct coordinates.', true); return; }
    const [userLat, userLng] = raw.split(',').map(c => parseFloat(c.trim()));
    const ngos = await fetchNGOs();
    // Simplified distance filter (5km)
    const nearby = ngos.filter(n => n.latitude && n.longitude && getDistance(userLat, userLng, n.latitude, n.longitude) <= 5);
    setLocationMessage(nearby.length ? 'Showing NGOs near you.' : 'No nearby NGOs found.', !nearby.length);
    displayNGOs(nearby, '');
}

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Display ────────────────────────────────────────────────────────

function displayNGOs(ngos, query = '') {
    const list = document.getElementById('ngoList');
    list.innerHTML = '';

    if (!ngos.length) {
        const div = document.createElement('div');
        div.className = 'no-results';
        div.textContent = query ? "Sorry, we can't find this NGO" : 'No NGOs available.';
        list.appendChild(div);
        return;
    }

    ngos.forEach(ngo => {
        const item = document.createElement('div');
        item.className = 'ngo-item';
        item.innerHTML = `
            <h4>${ngo.name}</h4>
            <p>📍 ${ngo.location}</p>
            <p>${ngo.focus}</p>
        `;
        item.addEventListener('click', () => selectNGO(ngo));
        list.appendChild(item);
    });
}

function selectNGO(ngo) {
    currentNGO = ngo;
    document.getElementById('panelNgoName').textContent = `Support ${ngo.name}`;
    document.getElementById('panelNgoDetails').textContent = `Focused on: ${ngo.focus}`;
    setVolunteerMessage('');
}

// ── Donation Logic ──────────────────────────────────────────────────

async function donateMoney() {
    if (!currentNGO) { alert('Please select an NGO first.'); return; }
    
    const amount = document.getElementById('amount').value;
    if (!amount || amount < 1) { alert('Minimum donation is 1 INR.'); return; }

    try {
        const res = await fetch('/api/donate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                ngo_name: currentNGO.name,
                ngo_id: currentNGO.ngo_id,
                amount: Number(amount)
            })
        });

        if (!res.ok) { alert('Failed to record donation.'); return; }
        
        // Trigger Dummy Payment
        const scannerCode = `RAZORPAY_QR_${currentNGO.name.replace(/\s+/g, '_')}`;
        alert(`Razorpay Dummy Scanner for ${currentNGO.name}:\n\n${scannerCode}\nAmount: ${amount} INR`);
        
        document.getElementById('amount').value = '';
        setVolunteerMessage(`Thank you! Payment of ${amount} INR initiated.`, false);
    } catch (err) {
        alert('Network error. Please try again.');
    }
}

async function donateItems() {
    const authenticated = await checkAuth();
    if (!authenticated) { showModal(); return; }
    if (!currentNGO) { alert('Please select an NGO first.'); return; }

    const items = document.getElementById('items').value.trim();
    if (!items) { alert('Please list items to donate.'); return; }

    // This would typically be a POST to /api/donate-items
    alert(`Item list sent to ${currentNGO.name}. They will contact you for pickup/drop-off.`);
    document.getElementById('items').value = '';
    setVolunteerMessage('Item donation request submitted!', false);
}

function setVolunteerMessage(msg, error = false) {
    const el = document.getElementById('volunteerMessage');
    el.textContent = msg;
    el.style.color = error ? '#e53e3e' : '#166534';
}

// ── Auth Modal & Header ─────────────────────────────────────────────

function showModal() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('auth-modal').style.display = 'none'; }

async function updateHeaderOnLoad() {
    const authenticated = await checkAuth();
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons || !authenticated) return;
    authButtons.innerHTML = `
        <div class="hamburger" onclick="toggleUserMenu()" style="cursor:pointer;">☰ My Account</div>
        <div class="user-menu" id="userMenu" style="display:none; position:absolute; background:#fff; border:1px solid #ddd; padding:10px; border-radius:8px;">
            <a href="/dashboard" style="display:block; margin-bottom:5px;">Dashboard</a>
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

window.onload = async function () {
    const ngos = await fetchNGOs();
    displayNGOs(ngos);
    updateHeaderOnLoad();
    document.getElementById('auth-modal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
};