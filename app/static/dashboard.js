// dashboard.js

async function fetchDonations() {
    try {
        const res = await fetch('/api/get-donations', {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Error fetching donations:", err);
        return [];
    }
}

async function fetchVolunteerApplications() {
    try {
        const res = await fetch('/api/get-volunteer', {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error("Error fetching volunteer applications:", err);
        return [];
    }
}


function renderDonations(donations) {
    const container = document.getElementById("impactList");
    if (!container) return;

    if (donations.length === 0) {
        container.innerHTML = '<div class="impact-item"><p>No donations yet.</p></div>';
        return;
    }

    container.innerHTML = "";
    donations.forEach(d => {
        const div = document.createElement("div");
        div.classList.add("impact-item");
        div.innerHTML = `
            <p>
                <strong>NGO: </strong> ${d.ngo_name || d.ngo_id}
                <strong>Amount: </strong> ₹${d.amount}
                <strong>At: </strong><small>${d.created_at || ''}</small>
            </p>
            <hr>
        `;
        container.appendChild(div);
    });
}

function renderVolunteerApplications(applications) {
    const container = document.getElementById("applicationList");
    if (!container) return;

    if (applications.length === 0) {
        container.innerHTML = '<div class="application-item"><p>No applications yet.</p></div>';
        return;
    }

    container.innerHTML = "";
    applications.forEach(d => {
        const div = document.createElement("div");
        div.classList.add("application-item");
        div.innerHTML = `
            <p>
                <strong>NGO: </strong> ${d.ngo_name}
                <strong>Skill Needed: </strong> ${d.skill_needed}
                <strong>Skill Applied: </strong> ${d.skill_provided}
                <strong>Applied At: </strong><small>${d.applied_at}</small>
                <strong>Status: </strong><small>${d.status ?? 'Pending'}</small>
            </p>
            <hr>
        `;
        container.appendChild(div);
    });
}


async function loadDashboard() {
    const [donations, applications] = await Promise.all([
        fetchDonations(),
        fetchVolunteerApplications()
    ]);
    renderDonations(donations);
    renderVolunteerApplications(applications);
}

window.addEventListener("DOMContentLoaded", loadDashboard);