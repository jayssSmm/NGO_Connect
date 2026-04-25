// donations.js

async function fetchDonations() {
    try {
        const res = await fetch('/api/donations', {
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
    const container = document.getElementById("donations-list");
    if (!container) return;

    container.innerHTML = "";

    if (donations.length === 0) {
        container.innerHTML = "<p>No donations yet.</p>";
        return;
    }

    donations.forEach(d => {
        const div = document.createElement("div");
        div.classList.add("donation-card");

        div.innerHTML = `
            <p><strong>NGO:</strong> ${d.ngo_name || d.ngo_id}</p>
            <p><strong>Amount:</strong> ₹${d.amount}</p>
            <p><small>${d.created_at || ''}</small></p>
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