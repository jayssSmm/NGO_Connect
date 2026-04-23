
    let currentNGO = null;

    const ngos = [
        { name: 'Green Earth NGO', location: 'Kolkata', scannerId: 'GE001' },
        { name: 'Helping Hands', location: 'Delhi', scannerId: 'HH002' },
        { name: 'Child Care Foundation', location: 'Mumbai', scannerId: 'CCF003' },
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
        document.getElementById('donationSection').style.display = 'none'
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
        document.getElementById('donationSection').style.display = 'block';
    }

    async function donateMoney() {

        const amount = document.getElementById('amount').value;
        if (!amount || amount < 1) {
            alert('Minimum donation is 1 INR.');
            return;
        }
        showRazorpayScanner(currentNGO, amount);
    }

    function showRazorpayScanner(ngo, amount) {
        const scannerCode = `
RAZORPAY_QR_CODE_${ngo.scannerId}
Amount: ${amount} INR
NGO: ${ngo.name}
Scan this code with any UPI app to proceed with payment.

Dummy QR: [QR_${ngo.scannerId}_${Date.now()}]
        `;
        alert('Razorpay Dummy Scanner for ' + ngo.name + ':\n\n' + scannerCode + '\n\nAfter scanning and payment, you will receive confirmation.');
        setTimeout(() => processMoneyDonation(ngo, amount), 500);
    }

    async function processMoneyDonation(ngo, amount) {
        const authenticated = await checkAuth();
        let message = `Payment of ${amount} INR sent to ${ngo.name}. `;

        if (authenticated) {
            message += 'Confirmation received on both website and payment app.';
            alert(message);
        } else {
            message += 'Confirmation received on payment app.';
            alert(message);
        }

        document.getElementById('amount').value = '';
    }

    async function donateItemsBox(){
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

        const items = document.getElementById('items').value;
        if (items.trim()) {
            alert('Item list sent to ' + currentNGO.name + '. You will be notified of acceptance/rejection on your dashboard and email.');
        } else {
            alert('Please list items to donate.');
        }
    }

    function showModal() {
        document.getElementById('auth-modal').style.display = 'flex';
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
                    <a href="/logout">Logout</a>
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

    window.onload = function() {
        displayNGOs(ngos);
        updateHeaderOnLoad();

        document.getElementById('auth-modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    };
