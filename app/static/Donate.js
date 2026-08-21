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
function updateStepUI(step) {
    ['si1','si2','si3'].forEach((id, index) => {
        const el = document.getElementById(id);
        el.classList.remove('active', 'done');

        if (index + 1 < step) el.classList.add('done');
        if (index + 1 === step) el.classList.add('active');
    });
}

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
async function openDonateModal() {
    if (!currentNGO) {
        alert('Please select an NGO first.');
        return;
    }

    const isAuth = await checkAuth();
    if (!isAuth) {
        showModal(); // your login modal
        return;
    }

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
    hideStep('processing');
    hideStep('success');

    updateStepUI(1);

    selAmt = 0;
    document.getElementById('pay-lbl').textContent = '0';
    document.getElementById('custom-amt').value = '';

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
        alert('Enter valid amount');
        return;
    }
    hideStep('step1');
    showStep('step2');
    updateStepUI(2);
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
        alert('Enter name');
        return;
    }

    hideStep('step2');
    showStep('processing');
    updateStepUI(3);

    // fake progress animation
    const steps = ['ps1','ps2','ps3','ps4'];
    let i = 0;

    const interval = setInterval(() => {
        if (i < steps.length) {
            document.getElementById(steps[i]).classList.add('active');
            i++;
        }
    }, 500);

    setTimeout(async () => {
        clearInterval(interval);

        // 🔥 Backend call
        try {
            await fetch('/api/donate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    ngo_id: currentNGO.ngo_id,
                    amount: selAmt
                })
            });
        } catch (e) {
            console.log("Logging failed (non-critical)");
        }

        // Fill receipt
        document.getElementById('r-ngo').textContent = currentNGO.name;
        document.getElementById('r-loc').textContent = currentNGO.location || 'N/A';
        document.getElementById('r-contact').textContent = currentNGO.contact || '+91 XXXXX XXXXX';
        document.getElementById('r-nemail').textContent = currentNGO.email || 'ngo@email.com';
        document.getElementById('r-dname').textContent = donorName;
        document.getElementById('r-demail').textContent = document.getElementById('f-email').value || 'N/A';
        document.getElementById('r-amt').textContent = '₹' + selAmt;
        document.getElementById('r-freq').textContent = document.getElementById('freq').value;
        document.getElementById('r-card').textContent = '**** **** **** ' + document.getElementById('f-card').value.slice(-4);
        document.getElementById('r-date').textContent = new Date().toLocaleString();
        document.getElementById('r-txn').textContent = 'TXN-' + Math.random().toString(36).substring(2,8).toUpperCase();

        hideStep('processing');
        showStep('success');

    }, 2500);
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