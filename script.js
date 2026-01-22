// --- script.js v2.7 ---

const causeCodeHierarchy = { "Select a Category...":{},"Equipment/Tools (EQ)":{"Equipment/Tools":["EQ1: Equipment reliability...","EQ2: Inadequate/Unavailable equipment...","EQ3: Equipment/Tool Accountability inadequate"]},"Guidance (GD)":{"Guidance":["GD1: Guidance used was inadequate...","GD2: Guidance used conflicted...","GD3: Guidance used was obsolete...","GD4: Inspected unit guidance...","GD5: Other than inspected unit guidance"]},"Leadership/Supervision (LS)":{"Leadership/Supervision":["LS1: Supervisor/leadership involvement insufficient...","LS2: Ineffective communication","LS3: Decision-making process ineffective..."],"Work Environment":["LS4: Workforce effectiveness limited...","LS5: Physical working conditions not conducive...","LS6: Ops Tempo/Workload"],"Use of Resources":["LS7: Unit incorrectly prioritized...","LS8: Unit failed to adequately program..."]},"Resource Shortfall (RS)":{"Funding Shortfall":["RS1: Program shortfall (DAF level)","RS2: Program shortfall (MAJCOM/FLDCOM level)","RS3: Program shortfall (wing/delta/installation level)","RS4: Parent unit withheld funding"],"Personnel Shortfall":["RS5: Assigned personnel less than accepted averages...","RS6: Insufficient personnel due to TDY/deployment","RS7: Insufficient personnel due to medical profile","RS8: Insufficient personnel due to augmentee requirements...","RS9: Awaiting security clearance","RS14: Insufficient personnel due to PRP requirements"],"Equipment Shortfall":["RS10: Awaiting resupply","RS11: Not requisitioned","RS12: Maintenance","RS13: Deployed"]},"Safety (SE)":{"Aviation Safety":["SE1: Aviation Safety Program mgmt inadequate...","SE2: Selected aspects not implemented...","SE3: Supervisory support inadequate"],"Occupational Safety":["SE4: Occupational Safety Program mgmt inadequate...","SE5: Selected aspects not implemented...","SE6: Supervisory support inadequate"],"Space Safety":["SE7: Space Safety Program mgmt inadequate...","SE8: Selected aspects not implemented...","SE9: Supervisory support inadequate"],"Weapons Safety":["SE10: Weapons Safety Program mgmt inadequate...","SE11: Selected aspects not implemented...","SE12: Supervisory support inadequate"]},"Training (TR)":{"Program Management":["TR1: Training Program mgmt inadequate...","TR2: Training guidance/policy inadequate...","TR3: Training oversight inadequate...","TR4: Training support inadequate...","TR5: Controls/metrics inadequate..."],"Program Implementation":["TR6: Initial qualification inadequate...","TR7: Hands-on training inadequate...","TR8: Upgrade/certification inadequate...","TR9: Training Supervisory support inadequate...","TR10: Training evaluation tools inadequate...","TR11: Training documentation inadequate..."]},"Human Factors (HF)":{"Organizational Influences":["HF1: Ops tempo/Workload","HF2: Mission changes","HF3: Physical environment interfered..."],"Condition of Individual":["HF4: Attention management...","HF5: Emotional state interfered...","HF6: Inappropriate motivation...","HF7: Inappropriate substance use...","HF8: Fatigue","HF9: Unreported medical condition"],"Acts":["HF10: Skill-based errors...","HF11: Judgment/Decision-making errors...","HF12: Intentional violations..."]}};
    
function applyTheme(theme) { if (theme === 'dark') { document.body.classList.add('dark-mode'); document.getElementById('darkModeToggle').checked = true; } else { document.body.classList.remove('dark-mode'); document.getElementById('darkModeToggle').checked = false; } }
function toggleDarkMode() { const isDark = document.getElementById('darkModeToggle').checked; const theme = isDark ? 'dark' : 'light'; localStorage.setItem('theme', theme); applyTheme(theme); }
    
function initializeDashboard() {
    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme === 'light' ? 'light' : 'dark');
    populateCategories();
    document.querySelectorAll('#dataForm input, #dataForm textarea, #dataForm select').forEach(el => el.addEventListener('input', updateSlidePreview));
    document.querySelectorAll(".collapsible").forEach(coll => { coll.addEventListener("click", function() { this.classList.toggle("active"); const content = this.nextElementSibling; if (content.style.maxHeight) { content.style.maxHeight = null; } else { content.style.maxHeight = content.scrollHeight + "px"; } }); });
    
    document.getElementById('version-display').textContent = CURRENT_VERSION;
    document.getElementById('s_watermark').textContent = `v${CURRENT_VERSION}`;
    
    if (!checkForShareLink()) {
        checkForUpdates(null, false);
        clearForm();
    }

    renderDeficiencyList();
}
    
function updateSlidePreview() { const finalCause = (document.getElementById('editCauseCode').value || "").replace(/^[A-Z0-9]+: /,'') || "[select cause code]"; const correctiveAction = document.getElementById('editCapAction').value || "[insert process change]"; const timeframe = document.getElementById('editCapTimeframe').value || "(insert timeframe)"; const finalCapStatement = `Through root cause analysis, the unit determined that this deficiency was caused by ${finalCause}. To address this, the unit will ${correctiveAction}. Our updated process will be tested and adjusted, as necessary, over the next ${timeframe}. Upon completion of this period, we will validate the CAP during ${document.getElementById('editValidation').value || "..."}. If there are ${document.getElementById('editMetric').value || "..."}, we will ${document.getElementById('editClosureAction').value} the deficiency at the ${document.getElementById('editClosureAuthority').value} level.`; document.getElementById('s_header').textContent = document.getElementById('editTracking').value || "TRACKING NUMBER"; document.getElementById('s_body').textContent = finalCapStatement; }
function downloadSlide() { html2canvas(document.getElementById('slide-to-capture')).then(canvas => { const link = document.createElement('a'); link.download = `CAP_Slide_${document.getElementById('editTracking').value || 'Untitled'}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }); }
function populateCategories(){const t=document.getElementById("editCauseCategory");t.innerHTML="";for(const e in causeCodeHierarchy)t.add(new Option(e,e))}function populateSubcategories(t,e=null){const n=document.getElementById("editCauseSubcategory");n.innerHTML="<option>Select...</option>",populateCauseCodes(null),t&&causeCodeHierarchy[t]&&Object.keys(causeCodeHierarchy[t]).forEach(t=>n.add(new Option(t,t))),e&&(n.value=e)}function populateCauseCodes(t,e=null){const n=document.getElementById("editCauseCode");n.innerHTML="<option>Select...</option>";const o=document.getElementById("editCauseCategory").value;o&&t&&causeCodeHierarchy[o]&&causeCodeHierarchy[o][t]&&causeCodeHierarchy[o][t].forEach(t=>n.add(new Option(t,t))),e&&(n.value=e)}
    
function renderDeficiencyList() {
    let deficiencies = JSON.parse(localStorage.getItem('usapm_tool_deficiencies')) || [];
    const container = document.getElementById('deficiencyListContainer');
    const filterKeyword = document.getElementById('filterKeyword').value.toLowerCase();
    const filterSeverity = document.getElementById('filterSeverity').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const sortBy = document.getElementById('sortBy')?.value || 'date-newest';
    let filtered = deficiencies.filter(item => {
        const keywordMatch = !filterKeyword || (item.writeup && item.writeup.toLowerCase().includes(filterKeyword)) || (item.trackingNumber && item.trackingNumber.toLowerCase().includes(filterKeyword)) || (item.poc && item.poc.toLowerCase().includes(filterKeyword));
        const severityMatch = filterSeverity === 'All Severities' || item.severity === filterSeverity;
        const statusMatch = filterStatus === 'All' || (item.status || 'New') === filterStatus;
        return keywordMatch && severityMatch && statusMatch;
    });
    const severityOrder = { "Critical": 3, "Significant": 2, "Minor": 1 };
    switch (sortBy) {
        case 'date-newest': filtered.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited)); break;
        case 'date-oldest': filtered.sort((a, b) => new Date(a.lastEdited) - new Date(b.lastEdited)); break;
        case 'severity': filtered.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)); break;
        case 'tracking-az': filtered.sort((a, b) => (a.trackingNumber || '').localeCompare(b.trackingNumber || '')); break;
    }
    container.innerHTML = '';
    filtered.forEach(item => {
        const lastEditedDate = item.lastEdited ? new Date(item.lastEdited).toLocaleString() : 'Not yet saved';
        const status = item.status || 'New';
        const itemDiv = document.createElement('div');
        itemDiv.className = 'deficiency-list-item';
        itemDiv.innerHTML = `<div>
                                <span><strong>${item.trackingNumber}</strong>: ${(item.writeup || '').split('\n')[0]}</span>
                                <div class="item-meta">
                                    <span class="status-indicator status-${status.toLowerCase()}">${status}</span> | POC: ${item.poc || 'N/A'} | Last Edited: ${lastEditedDate}
                                </div>
                             </div>
                             <div>
                                <button class="btn" onclick="shareDeficiency(${item.id})" style="background-color: #6f42c1;">Share</button>
                                <button class="btn edit-btn" onclick="loadDeficiency(${item.id})">Edit</button>
                                <button class="btn remove-btn" onclick="removeDeficiency(${item.id})">Delete</button>
                             </div>`;
        container.appendChild(itemDiv);
    });
}

function loadDeficiency(t) { const e = (JSON.parse(localStorage.getItem('usapm_tool_deficiencies')) || []).find(e => e.id === t); if (!e) return; setFormState(true); document.getElementById('currentId').value = e.id, document.getElementById('editWriteup').value = e.writeup || "", document.getElementById('editTracking').value = e.trackingNumber || "", document.getElementById('editSeverity').value = e.severity || "Minor", document.getElementById('editPoc').value = e.poc || "", document.getElementById('editCauseCategory').value = e.capCauseCategory || "Select a Category...", populateSubcategories(e.capCauseCategory, e.capCauseSubcategory), populateCauseCodes(e.capCauseSubcategory, e.capCauseCode), document.getElementById('editCapAction').value = e.capAction || "", document.getElementById('editCapTimeframe').value = e.capTimeframe || "", document.getElementById('editValidation').value = e.capValidation || "", document.getElementById('editMetric').value = e.capMetric || "", document.getElementById('editClosureAction').value = e.closureAction || "request closure of", document.getElementById('editClosureAuthority').value = e.closureAuthority || "", updateSlidePreview(); document.getElementById('saveBtn').textContent = 'Update Deficiency'; }
    
function saveDeficiency() {
    let t = JSON.parse(localStorage.getItem('usapm_tool_deficiencies')) || [];
    let e = document.getElementById('currentId').value;
    let isSharedUpdate = document.getElementById('saveBtn').textContent === 'Update Shared Deficiency';
    
    const n = { writeup: document.getElementById('editWriteup').value, trackingNumber: document.getElementById('editTracking').value, severity: document.getElementById('editSeverity').value, poc: document.getElementById('editPoc').value, capCauseCategory: document.getElementById('editCauseCategory').value, capCauseSubcategory: document.getElementById('editCauseSubcategory').value, capCauseCode: document.getElementById('editCauseCode').value, capAction: document.getElementById('editCapAction').value, capTimeframe: document.getElementById('editCapTimeframe').value, capValidation: document.getElementById('editValidation').value, capMetric: document.getElementById('editMetric').value, closureAction: document.getElementById('editClosureAction').value, closureAuthority: document.getElementById('editClosureAuthority').value, lastEdited: new Date().toISOString() };
    
    if (e) {
        const o = t.findIndex(t => t.id == e);
        if (o > -1) {
            n.id = t[o].id;
            n.status = isSharedUpdate ? 'Completed' : (t[o].status || 'New');
            t[o] = n;
        } else {
            n.id = parseInt(e);
            n.status = 'Completed'; // Item from a share link is now being saved
            t.push(n);
        }
    } else {
        n.id = Date.now();
        n.status = 'New';
        t.push(n);
    }
    
    localStorage.setItem('usapm_tool_deficiencies', JSON.stringify(t));
    renderDeficiencyList();
    clearForm();
}
    
function removeDeficiency(t) { if (!confirm('Are you sure you want to permanently delete this deficiency?')) return; let e = JSON.parse(localStorage.getItem('usapm_tool_deficiencies')) || []; e = e.filter(e => e.id !== t), localStorage.setItem('usapm_tool_deficiencies', JSON.stringify(e)), renderDeficiencyList(), clearForm() }

function clearForm() { document.getElementById('dataForm').reset(); document.getElementById('currentId').value = ''; populateCategories(); updateSlidePreview(); document.getElementById('saveBtn').textContent = 'Save / Add New'; setFormState(true); }
function createBackup() { const data = localStorage.getItem('usapm_tool_deficiencies'); if (!data || data === '[]') { alert("There is no data to backup."); return; } const formattedData = JSON.stringify(JSON.parse(data), null, 2); const backupTextarea = document.getElementById('backupData'); backupTextarea.value = formattedData; backupTextarea.style.display = 'block'; backupTextarea.select(); document.execCommand('copy'); alert("Backup data created below and copied to clipboard. Paste this into a plain .txt file and save it."); }
function restoreFromBackup() { const pastedText = prompt("Paste the entire contents of your backup file here:"); if (pastedText === null || pastedText.trim() === "") { alert("Restore cancelled."); return; } try { const data = JSON.parse(pastedText); if (Array.isArray(data)) { if (confirm("Are you sure you want to overwrite your current list with this backup? This cannot be undone.")) { localStorage.setItem('usapm_tool_deficiencies', JSON.stringify(data)); renderDeficiencyList(); clearForm(); alert("Restore successful!"); } } else { throw new Error("Data is not a valid array."); } } catch (e) { alert("Restore failed. The text provided was not valid backup data."); } }

function shareDeficiency(id) {
    let deficiencies = JSON.parse(localStorage.getItem('usapm_tool_deficiencies')) || [];
    const deficiencyIndex = deficiencies.findIndex(d => d.id === id);
    if (deficiencyIndex === -1) return;

    // Update status to 'Pending'
    deficiencies[deficiencyIndex].status = 'Pending';
    localStorage.setItem('usapm_tool_deficiencies', JSON.stringify(deficiencies));
    renderDeficiencyList(); // Re-render the list to show the new status

    const deficiency = deficiencies[deficiencyIndex];
    const data = JSON.stringify(deficiency);
    const encodedData = btoa(data);
    const url = new URL(window.location);
    url.hash = encodedData;
    navigator.clipboard.writeText(url.href).then(() => {
        alert('A shareable link for this deficiency has been copied to your clipboard!');
    }, () => {
        alert('Could not copy link. Please copy it manually:\n' + url.href);
    });
}
    
function checkForShareLink() {
    if (window.location.hash) {
        try {
            const encodedData = window.location.hash.substring(1);
            const decodedData = atob(encodedData);
            const deficiency = JSON.parse(decodedData);
            if (confirm('A shared deficiency has been detected. Do you want to load it into the form?')) {
                setFormState(false); 
                document.getElementById('currentId').value = deficiency.id || Date.now();
                document.getElementById('editWriteup').value = deficiency.writeup || "";
                document.getElementById('editTracking').value = deficiency.trackingNumber || "";
                document.getElementById('editSeverity').value = deficiency.severity || "Minor";
                document.getElementById('editPoc').value = deficiency.poc || "";
                document.getElementById('editCauseCategory').value = deficiency.capCauseCategory || "Select a Category...";
                populateSubcategories(deficiency.capCauseCategory, deficiency.capCauseSubcategory);
                populateCauseCodes(deficiency.capCauseSubcategory, deficiency.capCauseCode);
                document.getElementById('editCapAction').value = deficiency.capAction || "";
                document.getElementById('editCapTimeframe').value = deficiency.capTimeframe || "";
                document.getElementById('editValidation').value = deficiency.capValidation || "";
                document.getElementById('editMetric').value = deficiency.capMetric || "";
                document.getElementById('editClosureAction').value = deficiency.closureAction || "request closure of";
                document.getElementById('editClosureAuthority').value = deficiency.closureAuthority || "";
                updateSlidePreview();
                document.getElementById('saveBtn').textContent = 'Update Shared Deficiency';
            }
            history.pushState("", document.title, window.location.pathname + window.location.search);
            return true;
        } catch (e) {
            console.error("Failed to parse share link:", e);
            setFormState(true);
            return false;
        }
    }
    setFormState(true);
    return false;
}

function setFormState(isEnabled) {
    document.getElementById('editWriteup').disabled = !isEnabled;
    document.getElementById('editTracking').disabled = !isEnabled;
    document.getElementById('editSeverity').disabled = !isEnabled;
    document.getElementById('editPoc').disabled = !isEnabled;
}

const CURRENT_VERSION = "2.7";
const VERSION_CHECK_URL = 'https://gist.githubusercontent.com/hulettjg/b2b6705b5fd829f4110440d2eba91f6c/raw/bc0f48fe73fa58f688eaa533c4aa769810865318/version.json';

async function checkForUpdates(event, isManualCheck = false) { if (event) event.preventDefault(); if (isManualCheck) alert('Checking for the latest version...'); try { const response = await fetch(VERSION_CHECK_URL + '?t=' + Date.now()); if (!response.ok) throw new Error('Network response was not ok'); const versionInfo = await response.json(); if (isNewerVersion(versionInfo.latestVersion, CURRENT_VERSION)) { let updateMessage = `A new version (${versionInfo.latestVersion}) is available!\n\n`; updateMessage += `You are currently using version ${CURRENT_VERSION}.\n\n`; updateMessage += `What's New:\n${versionInfo.releaseNotes}\n\n`; updateMessage += `Click OK to refresh and load the new version.`; if (confirm(updateMessage)) { window.location.reload(); } } else if (isManualCheck) { alert(`You are using the latest version (${CURRENT_VERSION}).`); } } catch (error) { console.error('Update check failed:', error); if (isManualCheck) alert('Could not check for updates. This might be due to network restrictions.'); } }
function isNewerVersion(v1, v2) { const parts1 = v1.split('.').map(Number); const parts2 = v2.split('.').map(Number); for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) { const p1 = parts1[i] || 0; const p2 = parts2[i] || 0; if (p1 > p2) return true; if (p1 < p2) return false; } return false; }
