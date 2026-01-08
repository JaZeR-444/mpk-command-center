// --- Data Source ---

const controlsData =;

const troubleData =;

// --- State Management ---
let currentMode = 'studio'; // 'studio' or 'live'
let selectedControlId = 'keys'; // default

// --- DOM Elements ---
const controlListEl = document.getElementById('control-list-container');
const detailViewEl = document.getElementById('control-detail-view');
const modeButtons = document.querySelectorAll('.mode-btn');
const searchInput = document.getElementById('control-search');
const tsTableBody = document.querySelector('#ts-table tbody');
const tsSearchInput = document.getElementById('ts-search');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderControlList(controlsData);
    renderControlDetail(selectedControlId);
    renderTroubleshooting(troubleData);
    initScrollSpy();
});

// --- Functions ---

// 1. Render Control List
function renderControlList(data) {
    controlListEl.innerHTML = '';
    data.forEach(ctrl => {
        const btn = document.createElement('button');
        btn.className = `control-item ${ctrl.id === selectedControlId? 'active' : ''}`;
        btn.textContent = ctrl.name;
        btn.onclick = () => {
            selectedControlId = ctrl.id;
            updateActiveListButton();
            renderControlDetail(ctrl.id);
        };
        controlListEl.appendChild(btn);
    });
}

function updateActiveListButton() {
    document.querySelectorAll('.control-item').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent === controlsData.find(c => c.id === selectedControlId).name) {
            btn.classList.add('active');
        }
    });
}

// 2. Render Detail View
function renderControlDetail(id) {
    const data = controlsData.find(c => c.id === id);
    if (!data) return;

    // Determine suggestion based on mode
    const suggestionTitle = currentMode === 'studio'? 'Studio Production Mapping' : 'Live Performance Mapping';
    const suggestionText = currentMode === 'studio'? data.studioTip : data.liveTip;
    const accentClass = currentMode === 'studio'? 'text-accent' : 'text-primary';

    detailViewEl.innerHTML = `
        <div class="detail-header">
            <h3>${data.name}</h3>
            <span class="midi-tag">${data.midiType}</span>
        </div>
        <p><strong>Physical Logic:</strong> ${data.desc}</p>
        <p style="margin-top: 10px; font-size: 0.9rem; color: #888;">
            <strong>Default Behavior:</strong> ${data.defaultBehavior}
        </p>
        <div class="suggestion-box">
            <h4>${suggestionTitle}</h4>
            <p>${suggestionText}</p>
        </div>
        <div style="margin-top: 15px; font-size: 0.85rem; border-top: 1px solid #333; padding-top: 10px;">
            Default Mapping: <code>${data.mapping}</code>
        </div>
    `;
}

// 3. Mode Toggling
modeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        modeButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
        // Re-render current detail to show new tips
        renderControlDetail(selectedControlId);
    });
});

// 4. Search Filter (Dictionary)
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = controlsData.filter(c => c.name.toLowerCase().includes(term));
    renderControlList(filtered);
});

// 5. Troubleshooting Logic
function renderTroubleshooting(data) {
    tsTableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.symptom}</strong></td>
            <td>${item.cause}</td>
            <td style="color: var(--text-accent)">${item.fix}</td>
        `;
        tsTableBody.appendChild(row);
    });
}

tsSearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = troubleData.filter(item => 
        item.symptom.toLowerCase().includes(term) |

| 
        item.cause.toLowerCase().includes(term)
    );
    renderTroubleshooting(filtered);
});

// 6. Utility: Scroll Spy
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// 7. Utility: Copy to Clipboard
window.copyToClipboard = function(elementId) {
    const el = document.getElementById(elementId);
    const text = el.innerText |

| el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
};

window.copyTableData = function() {
    // Hardcoded logic for table copy simplicity
    const text = "Pads (Bank A): Ch 10\nKnobs 1-8: CC 70-77\nJoystick Y: CC 1\nClock: External";
    navigator.clipboard.writeText(text).then(() => alert('Table mappings copied!'));
};