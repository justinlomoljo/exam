// =================================================================
// SCHOLARCHECK SYSTEM - COMPLETE APPLICATION LOGIC
// Student: Justin Ryan Lomoljo (Student ID: 00102026)
// =================================================================

const SUPABASE_URL = "https://your-supabase-project.supabase.co";
const SUPABASE_ANON_KEY = "your-supabase-anon-key";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Global State
let currentRole = "Staff"; // "Staff" or "Scholar_A01", "Scholar_A03", etc.

// 1. Mock Scholar Profiles
const mockScholars = {
  "A01": { id: "00000000-0000-0000-0000-000000000001", student_id: "A01", full_name: "Juan Dela Cruz", program: "Merit Scholar", policy_id: 1 },
  "A02": { id: "00000000-0000-0000-0000-000000000002", student_id: "A02", full_name: "Maria Santos", program: "Merit Scholar", policy_id: 1 },
  "A03": { id: "00000000-0000-0000-0000-000000000003", student_id: "A03", full_name: "Pedro Reyes", program: "Community Scholar", policy_id: 2 },
  "A04": { id: "00000000-0000-0000-0000-000000000004", student_id: "A04", full_name: "Ana Gonzales", program: "Community Scholar", policy_id: 2 },
  "A05": { id: "00000000-0000-0000-0000-000000000005", student_id: "A05", full_name: "Mark Bautista", program: "Merit Scholar", policy_id: 1 },
  "A06": { id: "00000000-0000-0000-0000-000000000006", student_id: "A06", full_name: "Liza Soberano", program: "Community Scholar", policy_id: 2 }
};

// 2. Official Policy Threshold Rules
const policiesMap = {
  1: { name: "Merit Scholar", max_gwa: 1.75, min_units: 18, max_failed: 0, max_inc: 0, max_dropped: 0 },
  2: { name: "Community Scholar", max_gwa: 2.25, min_units: 15, max_failed: 0, max_inc: 0, max_dropped: 1 }
};

const OFFICIAL_DEADLINE = new Date("2026-10-30T17:00:00+08:00");

// 3. Pre-Populated Seed Records Dataset (AY 2026-2027 Semester 1)
let allSubmissions = [
  {
    submission_id: "10000000-0000-0000-0000-000000000001",
    student_id: "A01",
    student_name: "Juan Dela Cruz",
    program: "Merit Scholar",
    academic_year: "2026-2027",
    semester: "Semester 1",
    gwa: 1.75,
    enrolled_units: 18,
    failed_count: 0,
    inc_count: 0,
    dropped_count: 0,
    evidence_link: "https://drive.google.com/a01-grade-summary",
    submitted_at: "2026-10-30T17:00:00+08:00",
    is_late: false,
    verification_status: "Verified",
    compliance_status: "Compliant",
    deficiency_reasons: [],
    renewal_decision: { decision: "Approved", notes: "Exact upper boundary pass at deadline." }
  },
  {
    submission_id: "10000000-0000-0000-0000-000000000002",
    student_id: "A02",
    student_name: "Maria Santos",
    program: "Merit Scholar",
    academic_year: "2026-2027",
    semester: "Semester 1",
    gwa: 1.76,
    enrolled_units: 18,
    failed_count: 0,
    inc_count: 0,
    dropped_count: 0,
    evidence_link: "https://drive.google.com/a02-grade-summary",
    submitted_at: "2026-10-29T10:00:00+08:00",
    is_late: false,
    verification_status: "Verified",
    compliance_status: "With Deficiency",
    deficiency_reasons: ["GWA 1.76 exceeds max allowed limit of 1.75"],
    renewal_decision: { decision: "Held", notes: "GWA exceeds Merit threshold." }
  },
  {
    submission_id: "10000000-0000-0000-0000-000000000003",
    student_id: "A03",
    student_name: "Pedro Reyes",
    program: "Community Scholar",
    academic_year: "2026-2027",
    semester: "Semester 1",
    gwa: 2.25,
    enrolled_units: 15,
    failed_count: 0,
    inc_count: 0,
    dropped_count: 1,
    evidence_link: "https://drive.google.com/a03-grade-summary",
    submitted_at: "2026-10-29T10:00:00+08:00",
    is_late: false,
    verification_status: "Verified",
    compliance_status: "Compliant",
    deficiency_reasons: [],
    renewal_decision: { decision: "Approved", notes: "Community Scholar permits 1 dropped subject." }
  },
  {
    submission_id: "10000000-0000-0000-0000-000000000004",
    student_id: "A04",
    student_name: "Ana Gonzales",
    program: "Community Scholar",
    academic_year: "2026-2027",
    semester: "Semester 1",
    gwa: 2.25,
    enrolled_units: 14,
    failed_count: 0,
    inc_count: 1,
    dropped_count: 0,
    evidence_link: "https://drive.google.com/a04-grade-summary",
    submitted_at: "2026-10-29T10:00:00+08:00",
    is_late: false,
    verification_status: "Verified",
    compliance_status: "With Deficiency",
    deficiency_reasons: ["Enrolled units (14) below minimum required (15)", "Incomplete (INC) count (1) exceeds limit of 0"],
    renewal_decision: { decision: "Held", notes: "Multiple deficiencies present." }
  },
  {
    submission_id: "10000000-0000-0000-0000-000000000005",
    student_id: "A05",
    student_name: "Mark Bautista",
    program: "Merit Scholar",
    academic_year: "2026-2027",
    semester: "Semester 1",
    gwa: 1.50,
    enrolled_units: 18,
    failed_count: 1,
    inc_count: 0,
    dropped_count: 0,
    evidence_link: "https://drive.google.com/a05-grade-summary",
    submitted_at: "2026-10-30T17:01:00+08:00",
    is_late: true,
    verification_status: "Verified",
    compliance_status: "With Deficiency",
    deficiency_reasons: ["Late Submission (Passed Oct 30, 17:00 PST deadline)", "Failed subjects count (1) exceeds limit of 0"],
    renewal_decision: { decision: "Held", notes: "Submitted late and contains failed subject." }
  },
  {
    submission_id: "10000000-0000-0000-0000-000000000006",
    student_id: "A06",
    student_name: "Liza Soberano",
    program: "Community Scholar",
    academic_year: "2026-2027",
    semester: "Semester 1",
    gwa: 2.00,
    enrolled_units: 15,
    failed_count: 0,
    inc_count: 0,
    dropped_count: 0,
    evidence_link: "https://drive.google.com/a06-grade-summary",
    submitted_at: "2026-10-29T10:00:00+08:00",
    is_late: false,
    verification_status: "Pending Verification",
    compliance_status: "Pending Verification",
    deficiency_reasons: [],
    renewal_decision: null
  }
];

// Audit Trail Array
const auditLogs = [
  { timestamp: "18:40:12", action: "SYSTEM_INIT", targetId: "SYSTEM", actor: "System", details: "Initial seed dataset loaded for A01 - A06." }
];

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  switchRole("Staff");
});

// =================================================================
// ROLE SWITCHER & DASHBOARD TOGGLING
// =================================================================
function switchRole(selectedRole) {
  currentRole = selectedRole;
  const scholarView = document.getElementById("scholarView");
  const staffView = document.getElementById("staffView");

  if (selectedRole === "Staff") {
    scholarView.classList.add("hidden");
    staffView.classList.remove("hidden");
    renderStaffDashboard();
  } else {
    staffView.classList.add("hidden");
    scholarView.classList.remove("hidden");
    
    const scholarKey = selectedRole.replace("Scholar_", "");
    const scholar = mockScholars[scholarKey];
    
    // Set Individual Student Profile Info
    document.getElementById("scholarName").innerText = scholar.full_name;
    document.getElementById("scholarStudentId").innerText = scholar.student_id;
    document.getElementById("scholarPolicy").innerText = scholar.program;
    
    const pol = policiesMap[scholar.policy_id];
    document.getElementById("scholarMaxGwa").innerText = pol.max_gwa;
    document.getElementById("scholarMinUnits").innerText = pol.min_units;
    document.getElementById("scholarMaxDrop").innerText = pol.max_dropped;

    renderScholarPortal();
  }
}

// =================================================================
// AUTOMATED COMPLIANCE EVALUATION ENGINE
// =================================================================
function evaluateCompliance(sub) {
  if (sub.verification_status !== "Verified") {
    return { status: "Pending Verification", reasons: ["Evidence not verified"] };
  }

  const policy = sub.program === "Merit Scholar" ? policiesMap[8] : policiesMap[9];
  const defects = [];

  if (sub.is_late) defects.push("Late Submission (Passed Oct 30, 17:00 PST deadline)");
  if (sub.gwa > policy.max_gwa) defects.push(`GWA ${sub.gwa.toFixed(2)} exceeds max allowed limit of ${policy.max_gwa}`);
  if (sub.enrolled_units < policy.min_units) defects.push(`Enrolled units (${sub.enrolled_units}) below minimum required (${policy.min_units})`);
  if (sub.failed_count > policy.max_failed) defects.push(`Failed subjects count (${sub.failed_count}) exceeds limit of ${policy.max_failed}`);
  if (sub.inc_count > policy.max_inc) defects.push(`Incomplete (INC) count (${sub.inc_count}) exceeds limit of ${policy.max_inc}`);
  if (sub.dropped_count > policy.max_dropped) defects.push(`Dropped subjects count (${sub.dropped_count}) exceeds limit of ${policy.max_dropped}`);

  return {
    status: defects.length === 0 ? "Compliant" : "With Deficiency",
    reasons: defects
  };
}

// =================================================================
// GRADE SUBMISSION & DUPLICATE CHECK
// =================================================================
function handleGradeSubmission(event) {
  event.preventDefault();
  
  if (currentRole === "Staff") {
    alert("Staff users cannot submit grade summaries.");
    return;
  }

  const scholarKey = currentRole.replace("Scholar_", "");
  const scholar = mockScholars[scholarKey];

  const ay = document.getElementById("inputAY").value;
  const sem = document.getElementById("inputSem").value;
  const gwa = parseFloat(document.getElementById("inputGWA").value);
  const units = parseInt(document.getElementById("inputUnits").value);
  const failed = parseInt(document.getElementById("inputFailed").value);
  const inc = parseInt(document.getElementById("inputINC").value);
  const dropped = parseInt(document.getElementById("inputDropped").value);
  const evidence = document.getElementById("inputEvidence").value;

  // Duplicate Submission Prevention (BR04)
  const isDuplicate = allSubmissions.some(
    s => s.student_id === scholar.student_id && s.academic_year === ay && s.semester === sem
  );

  if (isDuplicate) {
    alert(`❌ Duplicate Submission Rejected: A grade summary for ${scholar.student_id} (${ay} ${sem}) already exists.`);
    return;
  }

  const submittedAt = new Date();
  const isLate = submittedAt > OFFICIAL_DEADLINE;

  const newSubmission = {
    submission_id: crypto.randomUUID(),
    student_id: scholar.student_id,
    student_name: scholar.full_name,
    program: scholar.program,
    academic_year: ay,
    semester: sem,
    gwa: gwa,
    enrolled_units: units,
    failed_count: failed,
    inc_count: inc,
    dropped_count: dropped,
    evidence_link: evidence,
    submitted_at: submittedAt.toISOString(),
    is_late: isLate,
    verification_status: "Pending Verification",
    verification_reason: null,
    compliance_status: "Pending Verification",
    deficiency_reasons: [],
    renewal_decision: null
  };

  allSubmissions.push(newSubmission);
  logAuditEvent("SUBMIT_SUMMARY", newSubmission.submission_id, scholar.student_id, `Submitted summary for ${ay} ${sem}`);
  
  alert("✅ Grade summary submitted successfully! Status set to Pending Verification.");
  document.getElementById("submissionForm").reset();
  renderScholarPortal();
}

// =================================================================
// RENDER INDIVIDUAL SCHOLAR PORTAL DASHBOARD
// =================================================================
function renderScholarPortal() {
  const scholarKey = currentRole.replace("Scholar_", "");
  const scholar = mockScholars[scholarKey];
  const tbody = document.getElementById("scholarSubmissionsTable");
  tbody.innerHTML = "";

  // Filter ONLY this scholar's submissions
  const scholarSubs = allSubmissions.filter(s => s.student_id === scholar.student_id);

  if (scholarSubs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">No submissions found for this semester.</td></tr>`;
    return;
  }

  scholarSubs.forEach(sub => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50";

    const compClass = sub.compliance_status === "Compliant" ? "bg-emerald-100 text-emerald-800" :
                      sub.compliance_status === "With Deficiency" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800";

    tr.innerHTML = `
      <td class="p-3 font-semibold text-slate-900">${sub.academic_year}<div class="text-xs text-slate-500">${sub.semester}</div></td>
      <td class="p-3 text-xs">GWA: <b>${sub.gwa.toFixed(2)}</b> | ${sub.enrolled_units} Units</td>
      <td class="p-3 text-xs">Fail: ${sub.failed_count} | INC: ${sub.inc_count} | Drop: ${sub.dropped_count}</td>
      <td class="p-3 text-xs"><a href="${sub.evidence_link}" target="_blank" class="text-indigo-600 underline hover:text-indigo-800">View Evidence</a></td>
      <td class="p-3"><span class="text-xs font-semibold px-2 py-0.5 rounded ${sub.verification_status === 'Verified' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}">${sub.verification_status}</span></td>
      <td class="p-3">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${compClass}">${sub.compliance_status}</span>
        ${sub.deficiency_reasons.length ? `<div class="text-[10px] text-rose-600 mt-1">\${sub.deficiency_reasons.join('; ')}</div>` : ''}
      </td>
      <td class="p-3 text-xs font-bold ${sub.renewal_decision?.decision === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}">${sub.renewal_decision?.decision || 'Under Evaluation'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =================================================================
// RENDER STAFF DASHBOARD & SEARCH / FILTER
// =================================================================
function renderStaffDashboard() {
  const tbody = document.getElementById("staffSubmissionsTable");
  tbody.innerHTML = "";

  // Update Metrics
  document.getElementById("metricTotal").innerText = allSubmissions.length;
  document.getElementById("metricPending").innerText = allSubmissions.filter(s => s.verification_status === "Pending Verification").length;
  document.getElementById("metricCompliant").innerText = allSubmissions.filter(s => s.compliance_status === "Compliant").length;
  document.getElementById("metricDeficient").innerText = allSubmissions.filter(s => s.compliance_status === "With Deficiency").length;

  filterStaffTable();
  renderAuditLogs();
}

function filterStaffTable() {
  const tbody = document.getElementById("staffSubmissionsTable");
  tbody.innerHTML = "";

  const query = (document.getElementById("staffSearch")?.value || "").toLowerCase();
  const progFilter = document.getElementById("filterProgram")?.value || "ALL";
  const statFilter = document.getElementById("filterStatus")?.value || "ALL";

  const filtered = allSubmissions.filter(s => {
    const matchQuery = s.student_id.toLowerCase().includes(query) || s.student_name.toLowerCase().includes(query);
    const matchProg = progFilter === "ALL" || s.program === progFilter;
    const matchStat = statFilter === "ALL" || s.compliance_status === statFilter;
    return matchQuery && matchProg && matchStat;
  });

  filtered.forEach(sub => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50";

    const compClass = sub.compliance_status === "Compliant" ? "bg-emerald-100 text-emerald-800" :
                      sub.compliance_status === "With Deficiency" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800";

    tr.innerHTML = `
      <td class="p-3 font-semibold text-slate-900">${sub.student_id}<div class="text-xs font-normal text-slate-500">${sub.student_name}</div></td>
      <td class="p-3 text-xs text-slate-600">${sub.program}</td>
      <td class="p-3 text-xs"><b>${sub.gwa.toFixed(2)}</b> / ${sub.enrolled_units} units</td>
      <td class="p-3 text-xs">${sub.is_late ? '<span class="text-rose-600 font-bold">Late</span>' : '<span class="text-emerald-600">On Time</span>'}</td>
      <td class="p-3"><span class="text-xs font-semibold px-2 py-0.5 rounded ${sub.verification_status === 'Verified' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}">${sub.verification_status}</span></td>
      <td class="p-3">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${compClass}">${sub.compliance_status}</span>
        ${sub.deficiency_reasons.length ? `<div class="text-[10px] text-rose-600 mt-1">\${sub.deficiency_reasons.join('; ')}</div>` : ''}
      </td>
      <td class="p-3 text-xs font-bold ${sub.renewal_decision?.decision === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}">${sub.renewal_decision?.decision || 'Pending'}</td>
      <td class="p-3 text-right space-x-1">
        <button onclick="openVerificationModal('${sub.submission_id}')" class="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded font-medium">Verify</button>
        <button onclick="openRenewalModal('${sub.submission_id}')" class="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded font-medium">Decide</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// =================================================================
// STAFF VERIFICATION & RENEWAL MODAL ACTIONS
// =================================================================
function openVerificationModal(subId) {
  const sub = allSubmissions.find(s => s.submission_id === subId);
  if (!sub) return;

  document.getElementById("modalTitle").innerText = `Verify Evidence: ${sub.student_id}`;
  document.getElementById("modalBody").innerHTML = `
    <p class="text-xs text-slate-600">Student: <b>${sub.student_name}</b> (${sub.program})</p>
    <p class="text-xs text-slate-600">Grade Link: <a href="${sub.evidence_link}" target="_blank" class="text-indigo-600 underline">Inspect Document</a></p>
    <div>
      <label class="block text-xs font-semibold text-slate-700 mb-1">Set Verification Status</label>
      <select id="modalVerifStatus" class="w-full text-sm border rounded p-2 bg-slate-50">
        <option value="Verified">Verified</option>
        <option value="Returned">Returned (Needs Correction)</option>
      </select>
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 mb-1">Staff Feedback Notes</label>
      <textarea id="modalVerifNotes" placeholder="Feedback notes..." class="w-full text-sm border rounded p-2"></textarea>
    </div>
  `;

  document.getElementById("modalConfirmBtn").onclick = () => saveVerification(subId);
  document.getElementById("actionModal").classList.remove("hidden");
}

function saveVerification(subId) {
  const sub = allSubmissions.find(s => s.submission_id === subId);
  const status = document.getElementById("modalVerifStatus").value;
  const notes = document.getElementById("modalVerifNotes").value;

  sub.verification_status = status;
  sub.verification_reason = notes;

  if (status === "Verified") {
    const evalResult = evaluateCompliance(sub);
    sub.compliance_status = evalResult.status;
    sub.deficiency_reasons = evalResult.reasons;
  } else {
    sub.compliance_status = "Pending Verification";
    sub.deficiency_reasons = [];
  }

  logAuditEvent("VERIFY_EVIDENCE", subId, "Staff", `Marked as ${status}. Notes: ${notes || "N/A"}`);
  closeModal();
  renderStaffDashboard();
}

function openRenewalModal(subId) {
  const sub = allSubmissions.find(s => s.submission_id === subId);
  if (!sub) return;

  if (sub.compliance_status === "With Deficiency") {
    alert("⛔ Renewal Authority Rule (BR06): Staff CANNOT approve a record with deficiency. Renewal must be set to 'Held'.");
  }

  document.getElementById("modalTitle").innerText = `Renewal Decision: ${sub.student_id}`;
  document.getElementById("modalBody").innerHTML = `
    <p class="text-xs text-slate-600">Compliance Status: <b class="${sub.compliance_status === 'Compliant' ? 'text-emerald-600' : 'text-rose-600'}">${sub.compliance_status}</b></p>
    <div>
      <label class="block text-xs font-semibold text-slate-700 mb-1">Renewal Decision</label>
      <select id="modalRenewalDecision" class="w-full text-sm border rounded p-2 bg-slate-50">
        <option value="Approved" ${sub.compliance_status !== "Compliant" ? "disabled" : ""}>Approved (Requires Compliant)</option>
        <option value="Held" selected>Held (Under Review / Deficient)</option>
      </select>
    </div>
    <div>
      <label class="block text-xs font-semibold text-slate-700 mb-1">Decision Notes</label>
      <textarea id="modalRenewalNotes" placeholder="Enter decision notes..." class="w-full text-sm border rounded p-2"></textarea>
    </div>
  `;

  document.getElementById("modalConfirmBtn").onclick = () => saveRenewalDecision(subId);
  document.getElementById("actionModal").classList.remove("hidden");
}

function saveRenewalDecision(subId) {
  const sub = allSubmissions.find(s => s.submission_id === subId);
  const decision = document.getElementById("modalRenewalDecision").value;
  const notes = document.getElementById("modalRenewalNotes").value;

  sub.renewal_decision = { decision, notes, decided_at: new Date().toISOString() };
  logAuditEvent("RENEWAL_DECISION", subId, "Staff", `Set renewal to ${decision}. Notes: ${notes}`);

  closeModal();
  renderStaffDashboard();
}

function closeModal() {
  document.getElementById("actionModal").classList.add("hidden");
}

function logAuditEvent(action, targetId, actor, details) {
  auditLogs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    action,
    targetId,
    actor,
    details
  });
  renderAuditLogs();
}

function renderAuditLogs() {
  const tbody = document.getElementById("auditLogsTable");
  if (!tbody) return;
  tbody.innerHTML = "";
  auditLogs.forEach(log => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="p-2">${log.timestamp}</td>
      <td class="p-2 font-bold text-indigo-600">${log.action}</td>
      <td class="p-2">${log.targetId.substring(0, 8)}...</td>
      <td class="p-2">${log.actor}</td>
      <td class="p-2 text-slate-500">${log.details}</td>
    `;
    tbody.appendChild(tr);
  });
}