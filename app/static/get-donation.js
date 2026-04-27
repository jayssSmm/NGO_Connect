// donations.js

async function fetchDonations() {
    try {
        const res = await fetch('/api/get-donations', {
            method: 'GET',
            credentials: 'include' // 🔥 important for JWT cookies
        });

        if (!res.ok) {
            console.log("User not authenticated or error fetching donations");
            return [];
        }

        const data = await res.json();
        return data;

    } catch (err) {
        console.error("Error fetching donations:", err);
        return [];
    }
}


function renderDonations(donations) {
    const container = document.getElementById("impactList");
    if (!container) return;

    container.innerHTML = "";

    if (donations.length === 0) {
        container.innerHTML = '<div class="impact-item"><p>No donations yet.</p></div>';
        return;
    }

    donations.forEach(d => {
        const div = document.createElement("div");
        div.classList.add("impact-item");

        div.innerHTML = `
            <p><strong>NGO: </strong> ${d.ngo_name || d.ngo_id}
            <strong>Amount: </strong> ₹${d.amount}
            <strong>At: </strong><small>${d.created_at || ''}</small></p>
            <hr>
        `;

        container.appendChild(div);
    });
}


// 🔥 Main loader
async function loadDonations() {
    const donations = await fetchDonations();
    renderDonations(donations);
}


// 🔥 Auto run when page loads
window.addEventListener("DOMContentLoaded", loadDonations);