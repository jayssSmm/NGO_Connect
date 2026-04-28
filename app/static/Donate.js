let currentNGO = null; 
let selAmt = 0; 

async function donateItems() {
    const itemsInput = document.getElementById('items');
    const itemsText = itemsInput.value.trim();

    // 🔒 Validate NGO
    if (!currentNGO) {
        alert('Please select an NGO first.');
        return;
    }

    // 📝 Validate input
    if (!itemsText) {
        alert('Please enter the items you want to donate.');
        return;
    }

    try {
        const res = await fetch('/api/donate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                ngo_id: currentNGO.ngo_id,
                ngo_name: currentNGO.name,
                item: itemsText   // ✅ matches backend
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to donate items');
        }

        // 🎉 Success
        alert(`Items donation recorded for ${currentNGO.name}!`);

        // Clear input
        itemsInput.value = '';

    } catch (err) {
        console.error(err);
        alert(err.message || 'Something went wrong.');
    }
}

// ── NGO FETCHING & API INTERACTION ──────────────────────────────────

/**
 * Fetches NGOs from the Flask backend
 * @param {string} query - The search term
 */
async function fetchNGOs(query = '') {
    const url = '/api/ngos' + (query ? `?q=${encodeURIComponent(query)}` : '');
    try {
        const res = await fetch(url, { credentials: 'same-origin' });
        const payload = await res.json();
        return res.ok ? (Array.isArray(payload) ? payload : []) : [];
    } catch (err) {
        console.error("Fetch error:", err);
        return [];
    }
}

/**
 * Validates if the user is logged in via the backend
 */
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
        return res.ok;
    } catch {
        return false;
    }
}

// ── SEARCH & GEOLOCATION ──────────────────────────────────────────────

/**
 * Triggered by the Search button
 */
async function searchNGOs() {
    const queryInput = document.getElementById('searchInput');
    const query = queryInput ? queryInput.value.trim() : '';
    
    // Clear any previous location messages
    const locMsg = document.getElementById('locationMessage');
    if (locMsg) locMsg.textContent = '';

    const ngos = await fetchNGOs(query);
    displayNGOs(ngos, query);
}

/**
 * Captures user coordinates via Browser API
 */
function getLocation() {
    const locMsg = document.getElementById('locationMessage');
    if (!navigator.geolocation) {
        if (locMsg) locMsg.textContent = 'Geolocation not supported.';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const coordsInput = document.getElementById('coordsInput');
            if (coordsInput) {
                coordsInput.value = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            }
            if (locMsg) {
                locMsg.textContent = 'Coordinates captured. Click Find.';
                locMsg.style.color = '#166534';
            }
        },
        () => {
            if (locMsg) locMsg.textContent = 'Unable to detect location.';
        }
    );
}

// ── DISPLAY & DOM MANIPULATION ──────────────────────────────────────

/**
 * Renders the list of NGOs in the left column
 */
function displayNGOs(ngos, query = '') {
    const list = document.getElementById('ngoList');
    if (!list) return;
    list.innerHTML = '';

    if (ngos.length === 0) {
        const div = document.createElement('div');
        div.className = 'no-results';
        div.textContent = query ? "Sorry, we can't find this NGO." : 'No NGOs available.';
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
        // When clicked, update the selection state and right panel
        item.addEventListener('click', () => selectNGO(ngo));
        list.appendChild(item);
    });
}

/**
 * Updates the right-hand panel with the clicked NGO's details
 */
function selectNGO(ngo) {
    currentNGO = ngo;
    
    // Unhide the donation section
    const section = document.getElementById('donationSection');
    if (section) section.style.display = 'grid';

    // Update labels in the right panel
    const nameLabel = document.getElementById('ngoName');
    const panelName = document.getElementById('panelNgoName');
    const panelDetails = document.getElementById('panelNgoDetails');

    if (nameLabel) nameLabel.textContent = ngo.name;
    if (panelName) panelName.textContent = `Support ${ngo.name}`;
    if (panelDetails) panelDetails.textContent = `Focused on: ${ngo.focus}`;
    
    // Reset any status messages
    const volMsg = document.getElementById('volunteerMessage');
    if (volMsg) volMsg.textContent = '';
}

// ── MULTI-STEP MODAL (POP-UP) LOGIC ──────────────────────────────────

/**
 * Triggers the pop-up modal and populates it with selected NGO data
 */
function openDonateModal() {
    if (!currentNGO) {
        alert('Please select an NGO from the list first.');
        return;
    }
    
    // Inject NGO metadata into the modal header
    document.getElementById('mh-name').textContent = 'Donate to ' + currentNGO.name;
    document.getElementById('mh-focus').textContent = "Impact: " + currentNGO.focus;
    
    resetModalState();
    document.getElementById('overlay').classList.add('active');
}

/**
 * Resets the modal steps and inputs
 */
function resetModalState() {
    showStep('step1');
    hideStep('step2');
    hideStep('success');
    selAmt = 0;
    document.getElementById('pay-lbl').textContent = '0';
    document.getElementById('custom-amt').value = '';
    
    // Clear button selections
    document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
}

function closeModal() {
    document.getElementById('overlay').classList.remove('active');
}

/**
 * Handles predefined amount buttons
 */
function pickAmt(btn, amt) {
    document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selAmt = amt;
    document.getElementById('custom-amt').value = '';
    document.getElementById('pay-lbl').textContent = amt.toLocaleString('en-IN');
}

/**
 * Handles custom number input
 */
function customInput(inp) {
    document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('selected'));
    const val = parseFloat(inp.value);
    selAmt = (val >= 1) ? val : 0;
    document.getElementById('pay-lbl').textContent = selAmt ? selAmt.toLocaleString('en-IN') : '0';
}

function toStep2() {
    if (!selAmt || selAmt < 1) {
        alert('Please select or enter a valid donation amount.');
        return;
    }
    hideStep('step1');
    showStep('step2');
}

/**
 * Formats card number input with spaces (XXXX XXXX...)
 */
function fmtCard(inp) {
    let v = inp.value.replace(/\D/g,'').substring(0,16);
    inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

/**
 * Final step: Simulates processing and displays the dynamic receipt
 */
async function toProcessing() {
    const donorName = document.getElementById('f-name').value.trim();
    if (!donorName) {
        alert('Please enter the name on the card.');
        return;
    }

    // Optional: Record donation in the backend database
    try {
        await fetch('/api/donate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                ngo_name: currentNGO.name,
                ngo_id: currentNGO.ngo_id,
                amount: Number(selAmt)
            })
        });
    } catch (err) {
        console.error("Non-critical: Failed to log donation to server.");
    }

    // Switch to success screen and fill receipt data
    hideStep('step2');
    document.getElementById('r-ngo').textContent = currentNGO.name;
    document.getElementById('r-amt').textContent = '₹' + selAmt.toLocaleString('en-IN');
    document.getElementById('r-txn').textContent = 'TXN-' + Math.random().toString(36).substring(2,8).toUpperCase();
    showStep('success');
}

// ── UTILITIES ────────────────────────────────────────────────────────

function showStep(id) { document.getElementById(id).classList.remove('hidden'); }
function hideStep(id) { document.getElementById(id).classList.add('hidden'); }

async function logout() {
    await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/';
}

// ── INITIALIZATION ───────────────────────────────────────────────────

window.onload = async function () {
    // Initial fetch of NGOs
    const ngos = await fetchNGOs();
    displayNGOs(ngos);

    // Close modal if user clicks the dark overlay background
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }
    
    // Close Auth modal on background click (legacy support)
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });
    }
};