    let currentNGO = null;

    async function fetchNGOs(query = '') {
        const url = '/api/ngos' + (query ? `?q=${encodeURIComponent(query)}` : '');
        const res = await fetch(url, { credentials: 'same-origin' });
        const payload = await res.json();
        return res.ok ? payload : [];
    }

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
            return res.ok;
        } catch {
            return false;
        }
    }

    async function searchNGOs() {
        const query = document.getElementById('searchInput').value.trim();
        document.getElementById('donationSection').style.display = 'none';
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
            item.className = 'ngo-item';
            item.innerHTML = `
                <h4>${ngo.name}</h4>
                <p>Location: ${ngo.location}</p>
                <p>${ngo.focus}</p>
            `;
            item.onclick = () => selectNGO(ngo);
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

    window.onload = async function() {
        const ngos = await fetchNGOs();
        displayNGOs(ngos);
        updateHeaderOnLoad();

        document.getElementById('auth-modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    };
