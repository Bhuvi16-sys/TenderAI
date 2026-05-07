// CONFIGURATION
const API_URL = "https://tenderai-backend-g9vx.onrender.com/analyze";

// STATE
let biddersAnalyzed = [];

// ELEMENTS (will be initialized in DOMContentLoaded)
let analyzeBtn, tenderFile, bidderFile, loader, resultsSection, bidderListBody, addNewTenderBtn;
let statTotalBidders, statEligible, statConfidence, statFlagged;
let modalOverlay, modalBidderName, modalSummary, modalConfidence, modalCriteria;
let navDashboard, navAllTenders, navBidders, navAnalytics, navSettings, dashboardView, tendersView, biddersView, analyticsView, settingsView, pageTitle;
let financialChart, technicalChart;
let tendersTableBody, biddersTableBody;

document.addEventListener("DOMContentLoaded", () => {
    analyzeBtn = document.getElementById("analyzeBtn");
    tenderFile = document.getElementById("tenderFile");
    bidderFile = document.getElementById("bidderFile");
    loader = document.getElementById("loader");
    resultsSection = document.getElementById("resultsSection");
    bidderListBody = document.getElementById("bidderListBody");
    addNewTenderBtn = document.getElementById("addNewTenderBtn");

    statTotalBidders = document.getElementById("statTotalBidders");
    statEligible = document.getElementById("statEligible");
    statConfidence = document.getElementById("statConfidence");
    statFlagged = document.getElementById("statFlagged");

    modalOverlay = document.getElementById("modalOverlay");
    modalBidderName = document.getElementById("modalBidderName");
    modalSummary = document.getElementById("modalSummary");
    modalConfidence = document.getElementById("modalConfidence");
    modalCriteria = document.getElementById("modalCriteria");

    navDashboard = document.getElementById("navDashboard");
    navAllTenders = document.getElementById("navAllTenders");
    navBidders = document.getElementById("navBidders");
    navAnalytics = document.getElementById("navAnalytics");
    navSettings = document.getElementById("navSettings");
    
    dashboardView = document.getElementById("dashboardView");
    tendersView = document.getElementById("tendersView");
    biddersView = document.getElementById("biddersView");
    analyticsView = document.getElementById("analyticsView");
    settingsView = document.getElementById("settingsView");
    
    pageTitle = document.getElementById("pageTitle");
    tendersTableBody = document.getElementById("tendersTableBody");
    biddersTableBody = document.getElementById("biddersTableBody");

    // EVENT LISTENERS
    if (analyzeBtn) analyzeBtn.addEventListener("click", runEvaluation);
    if (addNewTenderBtn) addNewTenderBtn.addEventListener("click", () => {
        // Clear files and status
        if (tenderFile) tenderFile.value = "";
        if (bidderFile) bidderFile.value = "";
        document.getElementById("tenderStatus").classList.add("hidden");
        document.getElementById("bidderStatus").classList.add("hidden");
        
        switchView("dashboard");
        
        // Highlight the tender upload zone
        const tenderZone = document.querySelector(".upload-zone");
        if (tenderZone) {
            tenderZone.style.borderColor = "var(--primary)";
            tenderZone.style.backgroundColor = "#eff6ff";
            setTimeout(() => {
                tenderZone.style.borderColor = "";
                tenderZone.style.backgroundColor = "";
            }, 1000);
        }
    });
    
    if (tenderFile) tenderFile.addEventListener("change", () => {
        updatePreview("tender");
        document.getElementById("tenderStatus").classList.remove("hidden");
    });
    
    if (bidderFile) bidderFile.addEventListener("change", () => {
        updatePreview("bidder");
        document.getElementById("bidderStatus").classList.remove("hidden");
    });

    if (navDashboard) navDashboard.addEventListener("click", () => switchView("dashboard"));
    if (navAllTenders) navAllTenders.addEventListener("click", () => switchView("allTenders"));
    if (navBidders) navBidders.addEventListener("click", () => switchView("bidders"));
    if (navAnalytics) navAnalytics.addEventListener("click", () => switchView("analytics"));
    if (navSettings) navSettings.addEventListener("click", () => switchView("settings"));

    const updateProfileBtn = document.getElementById("updateProfileBtn");
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener("click", () => {
            const name = document.getElementById("profileNameInput").value;
            const role = document.getElementById("profileRoleInput").value;
            
            // Update Header
            document.getElementById("headerUserName").innerText = name;
            document.getElementById("headerUserRole").innerText = role;
            
            // Generate initials for avatar
            const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
            document.getElementById("headerUserAvatar").innerText = initials.substring(0, 2);
            
            // Also update the avatar in the settings page
            const settingsAvatar = document.querySelector("#settingsView .user-avatar");
            if (settingsAvatar) settingsAvatar.innerText = initials.substring(0, 2);
            
            // Show success message
            const originalText = updateProfileBtn.innerText;
            updateProfileBtn.innerText = "✓ Profile Updated";
            updateProfileBtn.style.background = "var(--success)";
            
            setTimeout(() => {
                updateProfileBtn.innerText = originalText;
                updateProfileBtn.style.background = "";
            }, 2000);
        });
    }

    const changeAvatarBtn = document.getElementById("changeAvatarBtn");
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener("click", () => {
            alert("Avatar selection module is under development. Please choose a file in the next version.");
        });
    }

    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                alert("Account deletion request submitted to administrative portal.");
                window.location.reload();
            }
        });
    }

    const saveAiSettingsBtn = document.getElementById("saveAiSettingsBtn");
    if (saveAiSettingsBtn) {
        saveAiSettingsBtn.addEventListener("click", () => {
            const originalText = saveAiSettingsBtn.innerText;
            saveAiSettingsBtn.innerText = "✓ Settings Saved";
            saveAiSettingsBtn.style.background = "var(--success)";
            
            setTimeout(() => {
                saveAiSettingsBtn.innerText = originalText;
                saveAiSettingsBtn.style.background = "";
            }, 2000);
        });
    }
});

function switchView(view) {
    // Hide all views
    [dashboardView, tendersView, biddersView, analyticsView, settingsView].forEach(v => v && v.classList.add("hidden"));
    // Remove active class from all nav items
    [navDashboard, navAllTenders, navBidders, navAnalytics, navSettings].forEach(n => n && n.classList.remove("active"));

    if (view === "dashboard") {
        dashboardView.classList.remove("hidden");
        navDashboard.classList.add("active");
        pageTitle.innerText = "AI Tender Evaluation Platform";
    } else if (view === "allTenders") {
        tendersView.classList.remove("hidden");
        navAllTenders.classList.add("active");
        pageTitle.innerText = "All Tenders & Procurement";
        renderTenders();
    } else if (view === "bidders") {
        biddersView.classList.remove("hidden");
        navBidders.classList.add("active");
        pageTitle.innerText = "Bidder Management";
        renderBidders();
    } else if (view === "analytics") {
        analyticsView.classList.remove("hidden");
        navAnalytics.classList.add("active");
        pageTitle.innerText = "Bidder Comparison Analytics";
        renderAnalytics();
    } else if (view === "settings") {
        settingsView.classList.remove("hidden");
        navSettings.classList.add("active");
        pageTitle.innerText = "Platform Settings";
    }
    
    // Re-initialize icons for new view
    if (window.lucide) lucide.createIcons();
}

function renderTenders() {
    if (!tendersTableBody) return;
    
    // Get unique tenders from analyzed bidders
    const uniqueTenders = [];
    const tenderNames = new Set();
    
    biddersAnalyzed.forEach(b => {
        const tenderName = b.fullData.files?.tender || "Unknown Tender";
        if (!tenderNames.has(tenderName)) {
            tenderNames.add(tenderName);
            uniqueTenders.push({
                id: "TND-" + Math.floor(1000 + Math.random() * 9000),
                name: tenderName,
                date: new Date().toLocaleDateString(),
                status: "Processed"
            });
        }
    });

    if (uniqueTenders.length === 0) return;

    tendersTableBody.innerHTML = "";
    uniqueTenders.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>${t.id}</code></td>
            <td><strong>${t.name}</strong></td>
            <td>${t.date}</td>
            <td><span class="badge badge-eligible">Active</span></td>
            <td>
                <button class="btn-primary" style="padding: 4px 12px; font-size: 11px;">VIEW SPECS</button>
            </td>
        `;
        tendersTableBody.appendChild(tr);
    });
}

function renderBidders() {
    if (!biddersTableBody) return;
    if (biddersAnalyzed.length === 0) return;

    biddersTableBody.innerHTML = "";
    biddersAnalyzed.forEach(b => {
        const tr = document.createElement("tr");
        const revenue = b.fullData.bidder.financial?.avg_turnover || "N/A";
        const projects = b.fullData.bidder.technical?.projects_completed || "0";
        
        tr.innerHTML = `
            <td><strong>${b.name}</strong></td>
            <td>Admin User</td>
            <td>${projects} Projects</td>
            <td>Rs. ${revenue}</td>
            <td>
                <button class="btn-primary" style="padding: 4px 12px; font-size: 11px;" onclick="viewDetails(${b.id})">PROFILE</button>
            </td>
        `;
        biddersTableBody.appendChild(tr);
    });
}

// CORE LOGIC
async function runEvaluation() {
    // 1. Validate input
    if (!tenderFile.files[0] || !bidderFile.files[0]) {
        alert("Please upload both Tender and Bidder documents.");
        return;
    }

    toggleLoading(true);

    try {
        // 2. Prepare form data
        const formData = new FormData();
        formData.append("tender", tenderFile.files[0]);
        formData.append("bidder", bidderFile.files[0]);

        // 3. API call
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Server error during analysis");
        }

        console.log("Analysis Result:", data);

        // 4. Update state and UI
        addBidderToDashboard(data);
        updateStats();
        
        // Show results table
        resultsSection.classList.remove("hidden");

    } catch (error) {
        console.error("Error:", error);
        alert("Evaluation Error: " + error.message);
    } finally {
        toggleLoading(false);
    }
}

function addBidderToDashboard(data) {
    const bidder = {
        id: Date.now(),
        name: data.bidder.company_name || "Unknown Bidder",
        status: data.result.final_status,
        financial: getCategoryStatus(data.result.criteria_results.financial),
        technical: getCategoryStatus(data.result.criteria_results.technical),
        confidence: calculateAvgConfidence(data.confidence),
        fullData: data
    };

    biddersAnalyzed.unshift(bidder); // Add to start
    renderBidderTable();
}

function renderBidderTable() {
    if (!bidderListBody) return;
    bidderListBody.innerHTML = "";

    biddersAnalyzed.forEach(bidder => {
        const tr = document.createElement("tr");
        
        const badgeClass = 
            bidder.status === "Eligible" ? "badge-eligible" : 
            bidder.status === "Not Eligible" ? "badge-not-eligible" : 
            "badge-review";

        tr.innerHTML = `
            <td><strong>${bidder.name}</strong></td>
            <td><span class="badge ${badgeClass}">${bidder.status}</span></td>
            <td>${getStatusIcon(bidder.financial)}</td>
            <td>${getStatusIcon(bidder.technical)}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="confidence-bar-outer">
                        <div class="confidence-bar-inner" style="width: ${bidder.confidence}%"></div>
                    </div>
                    <span style="font-size: 12px; font-weight: 600;">${bidder.confidence}%</span>
                </div>
            </td>
            <td>
                <button class="btn-primary" style="padding: 4px 12px; font-size: 11px;" onclick="viewDetails(${bidder.id})">
                    VIEW DETAILS
                </button>
            </td>
        `;
        bidderListBody.appendChild(tr);
    });
}

function updateStats() {
    const total = biddersAnalyzed.length;
    const eligible = biddersAnalyzed.filter(b => b.status === "Eligible").length;
    const flagged = biddersAnalyzed.filter(b => b.status === "Manual Review").length;
    const avgConf = biddersAnalyzed.reduce((acc, curr) => acc + curr.confidence, 0) / (total || 1);

    if (statTotalBidders) statTotalBidders.innerText = total;
    if (statEligible) statEligible.innerText = eligible;
    if (statConfidence) statConfidence.innerText = Math.round(avgConf) + "%";
    if (statFlagged) statFlagged.innerText = flagged;
}

function viewDetails(bidderId) {
    const bidder = biddersAnalyzed.find(b => b.id === bidderId);
    if (!bidder) return;

    const data = bidder.fullData;

    modalBidderName.innerText = `Detailed Analysis: ${bidder.name}`;
    modalSummary.innerText = data.summary;

    // Confidence breakdown
    modalConfidence.innerHTML = "";
    Object.entries(data.confidence || {}).forEach(([key, val]) => {
        const percent = Math.round(val * 100);
        modalConfidence.innerHTML += `
            <div class="analysis-item">
                <span class="analysis-label">${key.toUpperCase()}</span>
                <span>${percent}%</span>
            </div>
            <div class="confidence-bar-outer" style="width: 100%; margin-bottom: 12px;">
                <div class="confidence-bar-inner" style="width: ${percent}%"></div>
            </div>
        `;
    });

    // Criteria verification
    modalCriteria.innerHTML = "";
    Object.entries(data.result.criteria_results || {}).forEach(([category, items]) => {
        modalCriteria.innerHTML += `<div style="font-weight: 700; margin-top: 12px; font-size: 13px; color: var(--primary); text-transform: uppercase;">${category}</div>`;
        Object.entries(items).forEach(([key, val]) => {
            const badgeClass = val.status === "Eligible" ? "badge-eligible" : val.status === "Not Eligible" ? "badge-not-eligible" : "badge-review";
            modalCriteria.innerHTML += `
                <div class="analysis-item" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-top: 8px;">
                    <div>
                        <div style="font-weight: 600;">${key.replace(/_/g, " ").toUpperCase()}</div>
                        <div style="font-size: 12px; color: #64748b;">Value: ${val.value || "Not Found"} | Req: ${val.required || "N/A"}</div>
                    </div>
                    <span class="badge ${badgeClass}">${val.status}</span>
                </div>
            `;
        });
    });

    modalOverlay.classList.add("show");

    // Update previews AFTER modal is shown to ensure correct rendering
    setTimeout(() => {
        const tenderUrl = data.files ? `https://tenderai-backend-g9vx.onrender.com/uploads/${data.files.tender}` : null;
        const bidderUrl = data.files ? `https://tenderai-backend-g9vx.onrender.com/uploads/${data.files.bidder}` : null;
        
        updatePreview("tender", tenderUrl);
        updatePreview("bidder", bidderUrl);
    }, 100);
    
    if (window.lucide) lucide.createIcons();
}

function updatePreview(type, remoteUrl = null) {
    const iframe = document.getElementById(`${type}Preview`);
    const imgPreview = document.getElementById(`${type}ImgPreview`);
    const noFileMsg = document.getElementById(`${type}NoFile`);
    const downloadLink = document.getElementById(`${type}Download`);
    
    let url = remoteUrl;
    let fileType = "";

    // If no remote URL, check local file input
    if (!url) {
        const fileInput = document.getElementById(`${type}File`);
        if (fileInput && fileInput.files[0]) {
            const file = fileInput.files[0];
            url = URL.createObjectURL(file);
            fileType = file.type;
        }
    } else {
        // Guess file type from remote URL
        fileType = url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    }

    // Hide all initially
    if (iframe) iframe.classList.add("hidden");
    if (imgPreview) imgPreview.classList.add("hidden");
    if (noFileMsg) noFileMsg.classList.add("hidden");
    if (downloadLink) downloadLink.classList.add("hidden");

    if (url) {
        if (fileType.startsWith('image/')) {
            if (imgPreview) {
                imgPreview.src = url;
                imgPreview.classList.remove("hidden");
            }
        } else {
            if (iframe) {
                iframe.src = url;
                iframe.classList.remove("hidden");
            }
        }
        
        if (downloadLink) {
            downloadLink.href = url;
            downloadLink.classList.remove("hidden");
        }
    } else {
        if (noFileMsg) noFileMsg.classList.remove("hidden");
    }
}

// UTILS
function toggleLoading(show) {
    if (show) loader.classList.remove("hidden");
    else loader.classList.add("hidden");
}

function calculateAvgConfidence(confObj) {
    const vals = Object.values(confObj || {});
    if (vals.length === 0) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
}

function getCategoryStatus(category) {
    if (!category) return "Review";
    const statuses = Object.values(category).map(item => item.status);
    if (statuses.includes("Not Eligible")) return "Not Eligible";
    if (statuses.includes("Needs Review")) return "Review";
    return "Eligible";
}

function getStatusIcon(status) {
    if (status === "Eligible" || status === "Pass") return `<i data-lucide="check-circle-2" style="color: var(--success); width: 18px;"></i>`;
    if (status === "Not Eligible" || status === "Fail") return `<i data-lucide="x-circle" style="color: var(--danger); width: 18px;"></i>`;
    return `<i data-lucide="alert-circle" style="color: var(--warning); width: 18px;"></i>`;
}

// Close modal on escape
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});

function renderAnalytics() {
    if (biddersAnalyzed.length === 0) return;

    // --- CHARTS ---
    const labels = biddersAnalyzed.map(b => b.name);
    const turnovers = biddersAnalyzed.map(b => b.fullData.bidder.financial?.avg_turnover || 0);
    const projects = biddersAnalyzed.map(b => b.fullData.bidder.technical?.projects_completed || 0);

    const ctxFin = document.getElementById('financialChart');
    if (ctxFin) {
        if (financialChart) financialChart.destroy();
        financialChart = new Chart(ctxFin.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg. Turnover (Rs)',
                    data: turnovers,
                    backgroundColor: '#1e3a8a',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const ctxTech = document.getElementById('technicalChart');
    if (ctxTech) {
        if (technicalChart) technicalChart.destroy();
        technicalChart = new Chart(ctxTech.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Projects Completed',
                    data: projects,
                    backgroundColor: '#0ea5e9',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // --- COMPARISON TABLE ---
    const head = document.getElementById("comparisonHead");
    const body = document.getElementById("comparisonBody");

    if (head && body) {
        head.innerHTML = "<th>Criteria</th>";
        biddersAnalyzed.forEach(b => {
            head.innerHTML += `<th>${b.name}</th>`;
        });

        body.innerHTML = "";
        
        const rows = [
            { label: "Overall Status", field: "status", isBadge: true },
            { label: "Turnover (Rs)", field: "financial.avg_turnover" },
            { label: "Net Worth (Rs)", field: "financial.net_worth" },
            { label: "Projects", field: "technical.projects_completed" },
            { label: "Experience (Yrs)", field: "technical.years_in_business" },
            { label: "ISO Certified", field: "technical.has_iso" }
        ];

        rows.forEach(row => {
            let tr = document.createElement("tr");
            tr.innerHTML = `<td><strong>${row.label}</strong></td>`;
            biddersAnalyzed.forEach(b => {
                let val = getNestedValue(b.fullData.bidder, row.field);
                if (row.field === "status") val = b.status; 
                
                if (row.isBadge) {
                    const bClass = val === "Eligible" ? "badge-eligible" : val === "Not Eligible" ? "badge-not-eligible" : "badge-review";
                    tr.innerHTML += `<td><span class="badge ${bClass}">${val}</span></td>`;
                } else {
                    tr.innerHTML += `<td>${val === null || val === undefined ? "N/A" : val}</td>`;
                }
            });
            body.appendChild(tr);
        });
    }
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}