document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main.page-content');
    if (!main) return;
    const page = main.dataset.page;
    if (!page) return;
    switch (page) {
        case 'urgency': initUrgency(); break;
        case 'clusters': initClusters(); break;
        case 'volunteer-match': initVolunteerMatch(); break;
        case 'resources': initResourceAllocation(); break;
        case 'efficiency': initEfficiency(); break;
        case 'alerts': initAlerts(); break;
        case 'trust': initTrustSystem(); break;
        default: break;
    }
});

function initUrgency() {
    const ngos = [
        { name: 'Silver Years Care Foundation', severity: 85, people: 94, time: 78, gap: 82 },
        { name: 'Golden Age Support Trust', severity: 72, people: 75, time: 68, gap: 60 },
        { name: 'Bright Future Children Foundation', severity: 63, people: 86, time: 55, gap: 47 },
        { name: 'Little Smiles Welfare Society', severity: 70, people: 78, time: 66, gap: 52 },
        { name: 'Hope for Every Child', severity: 59, people: 82, time: 61, gap: 43 },
        { name: 'Paws & Claws Rescue Foundation', severity: 80, people: 64, time: 72, gap: 69 },
        { name: 'Animal Care & Protection Trust', severity: 57, people: 60, time: 54, gap: 40 },
        { name: 'Lifeline Health Initiative', severity: 88, people: 93, time: 81, gap: 85 },
        { name: 'Knowledge Bridge Foundation', severity: 50, people: 69, time: 46, gap: 38 },
        { name: 'Shiksha Udaan Trust', severity: 65, people: 74, time: 59, gap: 48 }
    ];
    const weights = { w1: 0.25, w2: 0.25, w3: 0.25, w4: 0.25 };
    const sliders = document.querySelectorAll('.urgency-slider input');
    const urgencyList = document.getElementById('urgencyList');
    const chartCtx = document.getElementById('urgencyChart').getContext('2d');
    let urgencyChart;

    sliders.forEach((slider) => {
        slider.addEventListener('input', () => {
            weights[slider.name] = parseFloat(slider.value);
            slider.parentElement.querySelector('.slider-value').textContent = slider.value;
            renderUrgency();
        });
    });

    function renderUrgency() {
        const scored = ngos.map((ngo) => {
            const score = Math.round(
                weights.w1 * ngo.severity +
                weights.w2 * ngo.people +
                weights.w3 * ngo.time +
                weights.w4 * ngo.gap
            );
            return { ...ngo, score };
        }).sort((a, b) => b.score - a.score);

        urgencyList.innerHTML = scored.map((ngo) => {
            const color = ngo.score >= 70 ? 'red' : ngo.score >= 40 ? 'orange' : 'green';
            return `
                <div class="info-card">
                    <div class="card-header">
                        <h3>${ngo.name}</h3>
                        <span class="badge ${color}">${ngo.score}</span>
                    </div>
                    <p>Severity ${ngo.severity}, People Impact ${ngo.people}, Time Sensitivity ${ngo.time}, Resource Gap ${ngo.gap}</p>
                </div>
            `;
        }).join('');

        const labels = scored.map((ngo) => ngo.name);
        const values = scored.map((ngo) => ngo.score);
        if (urgencyChart) urgencyChart.destroy();
        urgencyChart = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Urgency Score', data: values, backgroundColor: values.map((v) => v >= 70 ? '#dc2626' : v >= 40 ? '#f59e0b' : '#16a34a') }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }

    renderUrgency();
}

function initClusters() {
    const clusters = [
        { name: 'Elderly Care', color: '#22c55e', ngos: ['Silver Years Care Foundation', 'Golden Age Support Trust'] },
        { name: 'Child Welfare', color: '#f97316', ngos: ['Bright Future Children Foundation', 'Little Smiles Welfare Society', 'Hope for Every Child'] },
        { name: 'Animal Welfare', color: '#2563eb', ngos: ['Paws & Claws Rescue Foundation', 'Animal Care & Protection Trust'] },
        { name: 'Healthcare + Education', color: '#7c3aed', ngos: ['Lifeline Health Initiative', 'Knowledge Bridge Foundation', 'Shiksha Udaan Trust'] }
    ];
    const chartCanvas = document.getElementById('clusterChart').getContext('2d');
    const clusterCards = document.getElementById('clusterCards');
    const filter = document.getElementById('clusterFilter');
    let clusterChart;

    function renderClusters(highlight) {
        clusterCards.innerHTML = clusters.map((cluster) => {
            const active = !highlight || highlight === cluster.name;
            const border = `4px solid ${cluster.color}`;
            const opacity = active ? 1 : 0.45;
            return `
                <div class="card-panel" style="border-left:${border}; opacity:${opacity};">
                    <h3>${cluster.name}</h3>
                    <p>${cluster.ngos.length} NGOs</p>
                    <ul>${cluster.ngos.map((name) => `<li>${name}</li>`).join('')}</ul>
                </div>
            `;
        }).join('');
    }

    function renderChart() {
        const labels = clusters.map((cluster) => cluster.name);
        const counts = clusters.map((cluster) => cluster.ngos.length);
        if (clusterChart) clusterChart.destroy();
        clusterChart = new Chart(chartCanvas, {
            type: 'bubble',
            data: {
                labels,
                datasets: [{
                    label: 'NGO Clusters',
                    data: clusters.map((cluster, index) => ({ x: index + 1, y: counts[index], r: counts[index] * 6 })),
                    backgroundColor: clusters.map((cluster) => cluster.color)
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    filter.addEventListener('change', () => renderClusters(filter.value === 'All' ? null : filter.value));
    renderClusters(null);
    renderChart();
}

function initVolunteerMatch() {
    const ngos = [
        { name: 'Silver Years Care Foundation', skills: ['Medical', 'Legal'], location: 'Salt Lake, Sector V, Kolkata', availability: ['Weekdays'] },
        { name: 'Golden Age Support Trust', skills: ['Education', 'Physical'], location: 'Behala, Kolkata', availability: ['Weekends'] },
        { name: 'Bright Future Children Foundation', skills: ['Education', 'Tech'], location: 'Dum Dum, Kolkata', availability: ['Weekdays', 'Weekends'] },
        { name: 'Little Smiles Welfare Society', skills: ['Medical', 'Education'], location: 'Park Circus, Kolkata', availability: ['Weekdays'] },
        { name: 'Hope for Every Child', skills: ['Legal', 'Tech'], location: 'Howrah (near Kolkata)', availability: ['Weekends'] },
        { name: 'Paws & Claws Rescue Foundation', skills: ['Physical', 'Medical'], location: 'New Town, Kolkata', availability: ['Weekdays', 'Weekends'] },
        { name: 'Animal Care & Protection Trust', skills: ['Physical', 'Tech'], location: 'Tollygunge, Kolkata', availability: ['Weekends'] },
        { name: 'Lifeline Health Initiative', skills: ['Medical'], location: 'Sealdah, Kolkata', availability: ['Weekdays'] },
        { name: 'Knowledge Bridge Foundation', skills: ['Education', 'Tech'], location: 'Garia, Kolkata', availability: ['Weekdays', 'Weekends'] },
        { name: 'Shiksha Udaan Trust', skills: ['Education', 'Legal'], location: 'Barasat (Greater Kolkata)', availability: ['Weekdays'] }
    ];
    const resultPanel = document.getElementById('matchResults');
    document.getElementById('matchForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const skills = Array.from(document.getElementById('skills').selectedOptions).map((opt) => opt.value);
        const location = document.getElementById('location').value;
        const availability = document.getElementById('availability').value;
        const volunteerName = document.getElementById('volunteerName').value.trim() || 'Volunteer';
        const scored = ngos.map((ngo) => {
            const skillMatch = ngo.skills.filter((skill) => skills.includes(skill)).length / ngo.skills.length;
            const locationMatch = ngo.location.includes(location) ? 1 : ngo.location.includes('Kolkata') ? 0.6 : 0.2;
            const availabilityMatch = ngo.availability.includes(availability) ? 1 : 0.5;
            const score = Math.round((skillMatch * 0.5 + locationMatch * 0.3 + availabilityMatch * 0.2) * 100);
            return { ...ngo, score };
        }).sort((a, b) => b.score - a.score);

        document.getElementById('matchSummary').textContent = `Matches for ${volunteerName}`;
        resultPanel.innerHTML = scored.map((ngo) => `
            <div class="task-card">
                <div class="card-header">
                    <div>
                        <h3>${ngo.name}</h3>
                        <p>${ngo.location}</p>
                    </div>
                    <span class="badge green">${ngo.score}%</span>
                </div>
                <p>Required skills: ${ngo.skills.join(', ')}</p>
                <p>Availability: ${ngo.availability.join(', ')}</p>
                <button type="button" class="primary-btn">Volunteer Now</button>
            </div>
        `).join('');
    });
}

function initResourceAllocation() {
    const ngos = [
        { name: 'Silver Years Care Foundation', volunteers: 18, funds: 120000, priority: 9 },
        { name: 'Golden Age Support Trust', volunteers: 12, funds: 85000, priority: 7 },
        { name: 'Bright Future Children Foundation', volunteers: 20, funds: 95000, priority: 8 },
        { name: 'Little Smiles Welfare Society', volunteers: 14, funds: 78000, priority: 6 },
        { name: 'Hope for Every Child', volunteers: 16, funds: 89000, priority: 8 },
        { name: 'Paws & Claws Rescue Foundation', volunteers: 10, funds: 76000, priority: 7 },
        { name: 'Animal Care & Protection Trust', volunteers: 9, funds: 62000, priority: 5 },
        { name: 'Lifeline Health Initiative', volunteers: 22, funds: 140000, priority: 10 },
        { name: 'Knowledge Bridge Foundation', volunteers: 15, funds: 82000, priority: 7 },
        { name: 'Shiksha Udaan Trust', volunteers: 13, funds: 80000, priority: 6 }
    ];
    const tableBody = document.getElementById('allocationInputBody');
    const resultsBody = document.getElementById('allocationResults');
    const chartCtx = document.getElementById('allocationChart').getContext('2d');
    let allocationChart;

    function renderInputTable() {
        tableBody.innerHTML = ngos.map((ngo) => `
            <tr>
                <td>${ngo.name}</td>
                <td>${ngo.volunteers}</td>
                <td>₹${ngo.funds.toLocaleString()}</td>
                <td>${ngo.priority}</td>
            </tr>
        `).join('');
    }

    function runOptimize() {
        const availableVols = parseInt(document.getElementById('availableVolunteers').value, 10) || 0;
        const totalBudget = parseInt(document.getElementById('totalBudget').value, 10) || 0;
        let remainingVols = availableVols;
        let remainingBudget = totalBudget;
        const sorted = [...ngos].sort((a, b) => b.priority - a.priority);
        const breakdown = { full: 0, partial: 0, unmet: 0 };

        resultsBody.innerHTML = sorted.map((ngo) => {
            const canFundVols = Math.min(remainingVols, ngo.volunteers);
            const fundShare = Math.round((canFundVols / ngo.volunteers) * ngo.funds);
            let status = 'unmet';
            if (canFundVols === ngo.volunteers && fundShare <= remainingBudget) status = 'full';
            else if (canFundVols > 0 && fundShare > 0) status = 'partial';
            if (status === 'full') {
                remainingVols -= ngo.volunteers;
                remainingBudget -= ngo.funds;
                breakdown.full += 1;
            } else if (status === 'partial') {
                remainingVols -= canFundVols;
                remainingBudget -= Math.min(fundShare, remainingBudget);
                breakdown.partial += 1;
            } else {
                breakdown.unmet += 1;
            }
            const color = status === 'full' ? 'green' : status === 'partial' ? 'orange' : 'red';
            return `
                <tr style="background:${status === 'full' ? '#ecfdf5' : status === 'partial' ? '#fffbeb' : '#fee2e2'};">
                    <td>${ngo.name}</td>
                    <td>${ngo.volunteers}</td>
                    <td>₹${ngo.funds.toLocaleString()}</td>
                    <td>${ngo.priority}</td>
                    <td><span class="badge ${color}">${status.toUpperCase()}</span></td>
                </tr>
            `;
        }).join('');

        if (allocationChart) allocationChart.destroy();
        allocationChart = new Chart(chartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Fully Met', 'Partially Met', 'Unmet'],
                datasets: [{ data: [breakdown.full, breakdown.partial, breakdown.unmet], backgroundColor: ['#16a34a', '#f97316', '#dc2626'] }]
            },
            options: { responsive: true }
        });
    }

    document.getElementById('optimizeButton').addEventListener('click', runOptimize);
    renderInputTable();
    runOptimize();
}

function initEfficiency() {
    const volunteers = [
        { name: 'Aisha Banerjee', tasks: 48, hours: 60, trust: 'Gold' },
        { name: 'Rohan Mukherjee', tasks: 40, hours: 54, trust: 'Silver' },
        { name: 'Priya Sen', tasks: 35, hours: 42, trust: 'Bronze' },
        { name: 'Manoj Das', tasks: 28, hours: 38, trust: 'Trusted' },
        { name: 'Nisha Roy', tasks: 33, hours: 40, trust: 'Trusted' },
        { name: 'Sanya Ghosh', tasks: 24, hours: 32, trust: 'Trusted' },
        { name: 'Arjun Dutta', tasks: 30, hours: 48, trust: 'Trusted' },
        { name: 'Tanya Chatterjee', tasks: 26, hours: 30, trust: 'Trusted' },
        { name: 'Riya Nanda', tasks: 22, hours: 28, trust: 'Trusted' },
        { name: 'Kabir Roy', tasks: 20, hours: 25, trust: 'Trusted' },
        { name: 'Megha Pal', tasks: 18, hours: 23, trust: 'Trusted' },
        { name: 'Ishita Saha', tasks: 16, hours: 20, trust: 'Trusted' },
        { name: 'Kunal Das', tasks: 15, hours: 18, trust: 'Trusted' },
        { name: 'Sneha Bandyopadhyay', tasks: 14, hours: 17, trust: 'Trusted' },
        { name: 'Devansh Sen', tasks: 12, hours: 15, trust: 'Trusted' }
    ];
    const tbody = document.getElementById('efficiencyBody');
    const headers = Array.from(document.querySelectorAll('#efficiencyTable th.sortable'));
    const chartCtx = document.getElementById('efficiencyTrendChart').getContext('2d');
    let efficiencyChart;
    let sortConfig = { key: 'efficiency', direction: 'desc' };

    volunteers.forEach((vol) => { vol.efficiency = Number((vol.tasks / vol.hours).toFixed(2)); });
    const topVolunteer = [...volunteers].sort((a, b) => b.efficiency - a.efficiency)[0];

    function compareValues(a, b, key) {
        if (typeof a[key] === 'string' || typeof b[key] === 'string') {
            return a[key].toString().localeCompare(b[key].toString(), undefined, { numeric: true });
        }
        return a[key] - b[key];
    }

    function renderTable() {
        const sorted = [...volunteers].sort((a, b) => {
            const result = compareValues(a, b, sortConfig.key);
            return sortConfig.direction === 'asc' ? result : -result;
        });
        tbody.innerHTML = sorted.map((vol, index) => {
            const rankClass = index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : '';
            const badge = vol.trust === 'Gold' ? '⭐ Verified' : vol.trust === 'Silver' ? 'Silver' : vol.trust;
            return `
                <tr class="${rankClass}">
                    <td>${index + 1}</td>
                    <td>${vol.name}</td>
                    <td>${vol.tasks}</td>
                    <td>${vol.hours}</td>
                    <td>${vol.efficiency}</td>
                    <td>${badge}</td>
                </tr>
            `;
        }).join('');
    }

    function renderChart() {
        const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
        const trend = [4.2, 4.4, 4.7, 4.8, 5.0, topVolunteer.efficiency];
        if (efficiencyChart) efficiencyChart.destroy();
        efficiencyChart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: topVolunteer.name,
                    data: trend,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34,197,94,0.16)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#166534'
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, suggestedMin: 3, suggestedMax: 6 } } }
        });
    }

    headers.forEach((header) => {
        header.addEventListener('click', () => {
            const key = header.dataset.key;
            if (sortConfig.key === key) {
                sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortConfig.key = key;
                sortConfig.direction = 'desc';
            }
            headers.forEach((h) => h.classList.remove('sorted-asc', 'sorted-desc'));
            header.classList.add(sortConfig.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
            renderTable();
        });
    });

    renderTable();
    renderChart();
}

function initAlerts() {
    const alerts = [
        { id: 1, severity: 'Critical', ngo: 'Lifeline Health Initiative', message: 'Volunteer shortage — only 2 active', time: '2 mins ago', type: 'critical' },
        { id: 2, severity: 'Warning', ngo: 'Paws & Claws Rescue Foundation', message: 'Medicine stock below threshold', time: '12 mins ago', type: 'warning' },
        { id: 3, severity: 'Info', ngo: 'Knowledge Bridge Foundation', message: 'New training session scheduled', time: '20 mins ago', type: 'info' },
        { id: 4, severity: 'Critical', ngo: 'Silver Years Care Foundation', message: 'Nursing team needs backup', time: '34 mins ago', type: 'critical' },
        { id: 5, severity: 'Warning', ngo: 'Bright Future Children Foundation', message: 'Study materials demand rising', time: '45 mins ago', type: 'warning' },
        { id: 6, severity: 'Info', ngo: 'Shiksha Udaan Trust', message: 'Volunteer orientation complete', time: '1 hr ago', type: 'info' },
        { id: 7, severity: 'Warning', ngo: 'Animal Care & Protection Trust', message: 'Shelter beds nearing capacity', time: '1 hr 15 mins ago', type: 'warning' },
        { id: 8, severity: 'Critical', ngo: 'Little Smiles Welfare Society', message: 'Child nutrition kits need urgent refill', time: '1 hr 40 mins ago', type: 'critical' }
    ];
    const feed = document.getElementById('alertsFeed');
    const filters = Array.from(document.querySelectorAll('[data-alert-filter]'));
    const unreadBadge = document.getElementById('unreadCount');
    let visibleType = 'All';

    function renderAlerts() {
        const filtered = alerts.filter((alert) => visibleType === 'All' || alert.severity === visibleType);
        feed.innerHTML = filtered.map((alert) => `
            <div class="alert-card ${alert.type} ${alert.read ? 'read' : ''}" data-id="${alert.id}">
                <div class="card-header">
                    <h3>${alert.ngo}</h3>
                    <span class="severity">${alert.severity}</span>
                </div>
                <p>${alert.message}</p>
                <div class="timestamp">${alert.time}</div>
            </div>
        `).join('');
        updateUnread();
        document.querySelectorAll('.alert-card').forEach((card) => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id, 10);
                const alert = alerts.find((item) => item.id === id);
                if (alert && !alert.read) {
                    alert.read = true;
                    card.classList.add('read');
                    updateUnread();
                }
            });
        });
    }

    function updateUnread() {
        const unread = alerts.filter((alert) => !alert.read).length;
        unreadBadge.textContent = unread;
    }

    filters.forEach((button) => {
        button.addEventListener('click', () => {
            filters.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            visibleType = button.dataset.alertFilter;
            renderAlerts();
        });
    });

    renderAlerts();
}

function initTrustSystem() {
    const volunteers = [
        { name: 'Aisha Banerjee', tasks: 54, rating: 4.8, consistency: 0.92 },
        { name: 'Rohan Mukherjee', tasks: 47, rating: 4.5, consistency: 0.88 },
        { name: 'Priya Sen', tasks: 42, rating: 4.7, consistency: 0.91 },
        { name: 'Manoj Das', tasks: 39, rating: 4.1, consistency: 0.82 },
        { name: 'Nisha Roy', tasks: 35, rating: 4.4, consistency: 0.86 },
        { name: 'Sanya Ghosh', tasks: 34, rating: 4.0, consistency: 0.79 },
        { name: 'Arjun Dutta', tasks: 31, rating: 4.2, consistency: 0.83 },
        { name: 'Tanya Chatterjee', tasks: 29, rating: 4.3, consistency: 0.85 },
        { name: 'Riya Nanda', tasks: 26, rating: 3.9, consistency: 0.76 },
        { name: 'Kabir Roy', tasks: 24, rating: 4.1, consistency: 0.81 },
        { name: 'Megha Pal', tasks: 22, rating: 4.0, consistency: 0.78 },
        { name: 'Ishita Saha', tasks: 20, rating: 3.8, consistency: 0.74 },
        { name: 'Kunal Das', tasks: 18, rating: 3.7, consistency: 0.68 },
        { name: 'Sneha Bandyopadhyay', tasks: 16, rating: 3.9, consistency: 0.71 },
        { name: 'Devansh Sen', tasks: 14, rating: 4.2, consistency: 0.84 }
    ];
    const results = document.getElementById('trustGrid');
    const searchInput = document.getElementById('trustSearch');
    const minScore = document.getElementById('minScore');
    const maxScore = document.getElementById('maxScore');

    volunteers.forEach((vol) => {
        const score = Math.round(vol.tasks * 0.4 + vol.rating * 10 * 0.4 + vol.consistency * 100 * 0.2);
        vol.trustScore = Math.min(100, score);
        vol.stars = '★'.repeat(Math.round(vol.rating)) + '☆'.repeat(5 - Math.round(vol.rating));
        vol.verified = vol.trustScore >= 88;
    });

    function filterVolunteers() {
        const query = searchInput.value.toLowerCase();
        const min = parseInt(minScore.value, 10) || 0;
        const max = parseInt(maxScore.value, 10) || 100;
        const filtered = volunteers.filter((vol) => {
            const matchesName = vol.name.toLowerCase().includes(query);
            const matchesScore = vol.trustScore >= min && vol.trustScore <= max;
            return matchesName && matchesScore;
        });
        renderGrid(filtered);
    }

    function renderGrid(list) {
        results.innerHTML = list.map((vol) => `
            <div class="trust-card">
                <div class="highlights">
                    <span>${vol.verified ? '⭐ Verified' : 'Trust Score'}</span>
                </div>
                <div class="avatar">${vol.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                <h3>${vol.name}</h3>
                <div class="trust-ring" style="--trust-pct:${vol.trustScore};">${vol.trustScore}</div>
                <div class="stars">${vol.stars}</div>
                <p>Tasks completed: ${vol.tasks}</p>
                <p>Consistency: ${Math.round(vol.consistency * 100)}%</p>
            </div>
        `).join('');
    }

    searchInput.addEventListener('input', filterVolunteers);
    minScore.addEventListener('input', filterVolunteers);
    maxScore.addEventListener('input', filterVolunteers);
    filterVolunteers();
}
