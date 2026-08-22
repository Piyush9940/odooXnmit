// ───── Mock Data ─────
let employees = [
    { id: "EMP-001", name: "Alice Smith", dept: "Engineering", desig: "Senior Developer", type: "Full-time", joinDate: "2024-01-15", status: "Active" },
    { id: "EMP-002", name: "Bob Johnson", dept: "HR", desig: "HR Manager", type: "Full-time", joinDate: "2023-11-01", status: "Active" },
    { id: "EMP-003", name: "Charlie Davis", dept: "Finance", desig: "Accountant", type: "Full-time", joinDate: "2024-03-10", status: "Active" },
    { id: "EMP-004", name: "Diana Prince", dept: "Marketing", desig: "SEO Specialist", type: "Contract", joinDate: "2024-05-20", status: "Active" },
    { id: "EMP-005", name: "Evan Wright", dept: "Engineering", desig: "Frontend Dev", type: "Part-time", joinDate: "2024-06-05", status: "Inactive" }
];

let attendance = [
    { empId: "EMP-001", name: "Alice Smith", date: "2026-08-22", checkIn: "08:55 AM", checkOut: "06:05 PM", hours: "9h 10m", status: "Present", remarks: "On time" },
    { empId: "EMP-002", name: "Bob Johnson", date: "2026-08-22", checkIn: "09:10 AM", checkOut: "06:00 PM", hours: "8h 50m", status: "Present", remarks: "Late Check-in" },
    { empId: "EMP-003", name: "Charlie Davis", date: "2026-08-22", checkIn: "-", checkOut: "-", hours: "0h", status: "Absent", remarks: "Uninformed" },
    { empId: "EMP-004", name: "Diana Prince", date: "2026-08-22", checkIn: "-", checkOut: "-", hours: "0h", status: "Leave", remarks: "Sick Leave" }
];

let leaves = [
    { id: 1, emp: "Alice Smith", dept: "Engineering", type: "Annual Leave", start: "2026-08-25", end: "2026-08-27", days: 3, reason: "Family Trip", applied: "2026-08-20", status: "Pending" },
    { id: 2, emp: "Charlie Davis", dept: "Finance", type: "Sick Leave", start: "2026-08-22", end: "2026-08-22", days: 1, reason: "Fever", applied: "2026-08-21", status: "Approved" },
    { id: 3, emp: "Evan Wright", dept: "Engineering", type: "Personal", start: "2026-08-15", end: "2026-08-15", days: 1, reason: "Appointments", applied: "2026-08-10", status: "Rejected" }
];

let payroll = [
    { emp: "Alice Smith", dept: "Engineering", basic: 60000, gross: 75000, deduct: 5000, net: 70000, status: "Paid" },
    { emp: "Bob Johnson", dept: "HR", basic: 50000, gross: 60000, deduct: 4000, net: 56000, status: "Paid" },
    { emp: "Charlie Davis", dept: "Finance", basic: 45000, gross: 55000, deduct: 3000, net: 52000, status: "Pending" }
];

let notifications = [
    { id: 1, title: "Leave Request", desc: "Alice Smith applied for Annual Leave.", time: "2 hours ago", read: false },
    { id: 2, title: "System Update", desc: "Payroll generated for July.", time: "1 day ago", read: false },
    { id: 3, title: "New Employee", desc: "Diana Prince joined Marketing.", time: "3 days ago", read: true }
];

// ───── UI State ─────
const pageTitles = {
    'dashboard': { title: 'Dashboard', desc: 'Overview of your HR metrics' },
    'employees': { title: 'Employees', desc: 'Manage your workforce' },
    'attendance': { title: 'Attendance', desc: 'Track daily attendance' },
    'leave': { title: 'Leave Management', desc: 'Review and approve time off' },
    'payroll': { title: 'Payroll', desc: 'Manage employee compensation' },
    'reports': { title: 'Reports', desc: 'View detailed analytics' },
    'notifications': { title: 'Notifications', desc: 'Recent system alerts' },
    'settings': { title: 'Settings', desc: 'Configure company policies' }
};

// ───── Initialization ─────
document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initNavigation();
    initMobileSidebar();
    
    // Render initial data
    renderEmployees();
    renderAttendance();
    renderLeaves();
    renderPayroll();
    renderNotifications();
    updateNotifBadge();
    
    // Init Charts
    initCharts();
    
    // Search/Filter Event Listeners
    document.getElementById('empSearch').addEventListener('input', renderEmployees);
    document.getElementById('empDeptFilter').addEventListener('change', renderEmployees);
    document.getElementById('empStatusFilter').addEventListener('change', renderEmployees);
    
    document.getElementById('attSearch').addEventListener('input', renderAttendance);
    document.getElementById('attDateFilter').addEventListener('change', renderAttendance);
    document.getElementById('attDeptFilter').addEventListener('change', renderAttendance);
    document.getElementById('attStatusFilter').addEventListener('change', renderAttendance);
    
    document.getElementById('leaveStatusFilter').addEventListener('change', renderLeaves);
    
    document.getElementById('paySearch').addEventListener('input', renderPayroll);
    document.getElementById('payrollDeptFilter').addEventListener('change', renderPayroll);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Demo: Logged out successfully.', 'success');
    });
});

function setCurrentDate() {
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-US', options);
}

// ───── Navigation ─────
function initNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-page]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateTo(page);
            
            // Close mobile sidebar on navigation
            const sidebar = document.getElementById('sidebar');
            if(window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });
}

function navigateTo(pageId) {
    // Update active nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.sidebar-nav .nav-item[data-page="${pageId}"]`);
    if(activeNav) activeNav.classList.add('active');
    
    // Update content visibility
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    const targetSection = document.getElementById(`sec-${pageId}`);
    if(targetSection) targetSection.classList.add('active');
    
    // Update topbar titles
    if (pageTitles[pageId]) {
        document.getElementById('pageTitle').innerText = pageTitles[pageId].title;
        document.getElementById('pageDesc').innerText = pageTitles[pageId].desc;
    }
}

function initMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileToggle');
    const close = document.getElementById('mobileClose');
    
    toggle.addEventListener('click', () => sidebar.classList.add('open'));
    close.addEventListener('click', () => sidebar.classList.remove('open'));
}

// ───── Helpers ─────
function getAvatar(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getStatusBadge(status) {
    const s = status.toLowerCase().replace(' ', '-');
    return `<span class="status-badge badge-${s}">${status}</span>`;
}

// ───── Employees Logic ─────
function renderEmployees() {
    const tbody = document.getElementById('employeeTbody');
    const search = document.getElementById('empSearch').value.toLowerCase();
    const dept = document.getElementById('empDeptFilter').value;
    const status = document.getElementById('empStatusFilter').value;
    
    let filtered = employees.filter(e => {
        const mSearch = e.name.toLowerCase().includes(search) || e.id.toLowerCase().includes(search);
        const mDept = dept === "" || e.dept === dept;
        const mStatus = status === "" || e.status === status;
        return mSearch && mDept && mStatus;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2rem;">No employees found</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(e => `
        <tr>
            <td>
                <div class="emp-profile-cell">
                    <div class="emp-avatar">${getAvatar(e.name)}</div>
                </div>
            </td>
            <td>${e.id}</td>
            <td><strong>${e.name}</strong></td>
            <td>${e.dept}</td>
            <td>${e.desig}</td>
            <td>${e.type}</td>
            <td>${e.joinDate}</td>
            <td>${getStatusBadge(e.status)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="viewEmployee('${e.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon edit" onclick="editEmployee('${e.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteEmployee('${e.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openEmpModal(isEdit = false) {
    document.getElementById('empModalTitle').innerText = isEdit ? 'Edit Employee' : 'Add Employee';
    document.getElementById('empForm').classList.remove('hidden');
    document.getElementById('empViewContent').classList.add('hidden');
    
    if(!isEdit) {
        document.getElementById('empForm').reset();
        document.getElementById('empEditId').value = '';
    }
    
    document.getElementById('modalBackdrop').classList.add('show');
    document.getElementById('empModal').classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    document.getElementById('modalBackdrop').classList.remove('show');
}

function saveEmployee(e) {
    e.preventDefault();
    const id = document.getElementById('empEditId').value;
    const name = document.getElementById('empFormName').value;
    const email = document.getElementById('empFormEmail').value; // dummy
    const dept = document.getElementById('empFormDept').value;
    const desig = document.getElementById('empFormDesig').value;
    const type = document.getElementById('empFormType').value;
    const status = document.getElementById('empFormStatus').value;
    
    if (id) {
        // Update
        const emp = employees.find(emp => emp.id === id);
        if(emp) {
            emp.name = name;
            emp.dept = dept;
            emp.desig = desig;
            emp.type = type;
            emp.status = status;
            showToast('Employee updated successfully', 'success');
        }
    } else {
        // Add
        const newId = 'EMP-0' + (employees.length + 10);
        employees.push({
            id: newId, name, dept, desig, type, status, joinDate: new Date().toISOString().split('T')[0]
        });
        showToast('Employee added successfully', 'success');
    }
    
    renderEmployees();
    closeModal('empModal');
}

function viewEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if(!emp) return;
    
    document.getElementById('empModalTitle').innerText = 'Employee Details';
    document.getElementById('empForm').classList.add('hidden');
    const viewContent = document.getElementById('empViewContent');
    viewContent.classList.remove('hidden');
    
    viewContent.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><label>ID</label><div>${emp.id}</div></div>
            <div class="detail-item"><label>Name</label><div>${emp.name}</div></div>
            <div class="detail-item"><label>Department</label><div>${emp.dept}</div></div>
            <div class="detail-item"><label>Designation</label><div>${emp.desig}</div></div>
            <div class="detail-item"><label>Type</label><div>${emp.type}</div></div>
            <div class="detail-item"><label>Status</label><div>${getStatusBadge(emp.status)}</div></div>
            <div class="detail-item"><label>Joining Date</label><div>${emp.joinDate}</div></div>
        </div>
        <div class="form-actions text-right">
            <button class="btn btn-outline" onclick="closeModal('empModal')">Close</button>
        </div>
    `;
    
    document.getElementById('modalBackdrop').classList.add('show');
    document.getElementById('empModal').classList.add('show');
}

function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if(!emp) return;
    
    document.getElementById('empEditId').value = emp.id;
    document.getElementById('empFormName').value = emp.name;
    document.getElementById('empFormEmail').value = emp.name.split(' ')[0].toLowerCase() + '@dayflow.com';
    document.getElementById('empFormDept').value = emp.dept;
    document.getElementById('empFormDesig').value = emp.desig;
    document.getElementById('empFormType').value = emp.type;
    document.getElementById('empFormStatus').value = emp.status;
    
    openEmpModal(true);
}

let deleteCallback = null;
function deleteEmployee(id) {
    document.getElementById('confirmTitle').innerText = 'Delete Employee';
    document.getElementById('confirmMessage').innerText = `Are you sure you want to delete employee ${id}?`;
    document.getElementById('modalBackdrop').classList.add('show');
    document.getElementById('confirmModal').classList.add('show');
    
    deleteCallback = () => {
        employees = employees.filter(e => e.id !== id);
        renderEmployees();
        showToast('Employee deleted successfully', 'success');
        closeModal('confirmModal');
    };
    
    document.getElementById('confirmBtn').onclick = deleteCallback;
}

// ───── Attendance Logic ─────
function renderAttendance() {
    const tbody = document.getElementById('attendanceTbody');
    const search = document.getElementById('attSearch').value.toLowerCase();
    const date = document.getElementById('attDateFilter').value;
    const dept = document.getElementById('attDeptFilter').value;
    const status = document.getElementById('attStatusFilter').value;
    
    let filtered = attendance.filter(a => {
        const emp = employees.find(e => e.id === a.empId) || { dept: '' };
        const mSearch = a.name.toLowerCase().includes(search) || a.empId.toLowerCase().includes(search);
        const mDate = date === "" || a.date === date;
        const mDept = dept === "" || emp.dept === dept;
        const mStatus = status === "" || a.status === status;
        return mSearch && mDate && mDept && mStatus;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2rem;">No attendance records found</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(a => `
        <tr>
            <td><strong>${a.name}</strong></td>
            <td>${a.empId}</td>
            <td>${a.date}</td>
            <td>${a.checkIn}</td>
            <td>${a.checkOut}</td>
            <td>${a.hours}</td>
            <td>${getStatusBadge(a.status)}</td>
            <td>${a.remarks}</td>
            <td>
                <button class="btn-icon edit" title="Edit"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

// ───── Leave Logic ─────
function renderLeaves() {
    const tbody = document.getElementById('leaveTbody');
    const status = document.getElementById('leaveStatusFilter').value;
    
    let filtered = leaves.filter(l => status === "" || l.status === status);
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem;">No leave requests found</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(l => `
        <tr>
            <td><strong>${l.emp}</strong></td>
            <td>${l.dept}</td>
            <td>${l.type}</td>
            <td>${l.start}</td>
            <td>${l.end}</td>
            <td>${l.days}</td>
            <td>${l.reason}</td>
            <td>${l.applied}</td>
            <td>${getStatusBadge(l.status)}</td>
            <td>
                <div class="action-btns">
                    ${l.status === 'Pending' ? `
                        <button class="btn-icon approve" onclick="approveLeave(${l.id})" title="Approve"><i class="fas fa-check"></i></button>
                        <button class="btn-icon reject" onclick="openRejectModal(${l.id})" title="Reject"><i class="fas fa-times"></i></button>
                    ` : ''}
                    <button class="btn-icon" title="View"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function approveLeave(id) {
    const leave = leaves.find(l => l.id === id);
    if(leave) {
        leave.status = 'Approved';
        renderLeaves();
        showToast(`Leave approved for ${leave.emp}`, 'success');
    }
}

function openRejectModal(id) {
    document.getElementById('rejectLeaveId').value = id;
    document.getElementById('rejectReason').value = '';
    document.getElementById('modalBackdrop').classList.add('show');
    document.getElementById('rejectModal').classList.add('show');
}

function confirmReject() {
    const id = parseInt(document.getElementById('rejectLeaveId').value);
    const reason = document.getElementById('rejectReason').value;
    const leave = leaves.find(l => l.id === id);
    
    if(leave) {
        leave.status = 'Rejected';
        renderLeaves();
        showToast(`Leave rejected for ${leave.emp}`, 'warning');
    }
    closeModal('rejectModal');
}

// ───── Payroll Logic ─────
const formatINR = (num) => '₹' + num.toLocaleString('en-IN');

function renderPayroll() {
    const tbody = document.getElementById('payrollTbody');
    const search = document.getElementById('paySearch').value.toLowerCase();
    const dept = document.getElementById('payrollDeptFilter').value;
    
    let filtered = payroll.filter(p => {
        const mSearch = p.emp.toLowerCase().includes(search);
        const mDept = dept === "" || p.dept === dept;
        return mSearch && mDept;
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">No payroll records found</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((p, i) => `
        <tr>
            <td><strong>${p.emp}</strong></td>
            <td>${p.dept}</td>
            <td>${formatINR(p.basic)}</td>
            <td>${formatINR(p.gross)}</td>
            <td>${formatINR(p.deduct)}</td>
            <td><strong>${formatINR(p.net)}</strong></td>
            <td>${getStatusBadge(p.status)}</td>
            <td>
                <button class="btn-icon" onclick="viewPayroll(${i})" title="View Details"><i class="fas fa-file-invoice-dollar"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewPayroll(index) {
    const p = payroll[index];
    if(!p) return;
    
    const content = document.getElementById('payrollViewContent');
    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><label>Employee</label><div>${p.emp}</div></div>
            <div class="detail-item"><label>Department</label><div>${p.dept}</div></div>
            <div class="detail-item"><label>Basic Salary</label><div>${formatINR(p.basic)}</div></div>
            <div class="detail-item"><label>Allowances</label><div>${formatINR(p.gross - p.basic)}</div></div>
            <div class="detail-item"><label>Gross Salary</label><div>${formatINR(p.gross)}</div></div>
            <div class="detail-item"><label>Deductions</label><div>${formatINR(p.deduct)}</div></div>
            <div class="detail-item"><label>Net Salary</label><div><strong style="color:var(--primary);font-size:1.1rem">${formatINR(p.net)}</strong></div></div>
            <div class="detail-item"><label>Status</label><div>${getStatusBadge(p.status)}</div></div>
        </div>
        <div class="form-actions text-right">
            <button class="btn btn-outline" onclick="closeModal('payrollModal')">Close</button>
            <button class="btn btn-primary"><i class="fas fa-download"></i> Download Slip</button>
        </div>
    `;
    
    document.getElementById('modalBackdrop').classList.add('show');
    document.getElementById('payrollModal').classList.add('show');
}

// ───── Notifications ─────
function renderNotifications() {
    const list = document.getElementById('notifList');
    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}">
            <div class="notif-icon"><i class="fas fa-bell"></i></div>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-desc">${n.desc}</div>
                <div class="notif-time">${n.time}</div>
            </div>
            ${!n.read ? `<button class="notif-action" onclick="markRead(${n.id})">Mark read</button>` : ''}
        </div>
    `).join('');
    updateNotifBadge();
}

function markRead(id) {
    const notif = notifications.find(n => n.id === id);
    if(notif) {
        notif.read = true;
        renderNotifications();
    }
}

function markAllNotifRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('All notifications marked as read', 'success');
}

function updateNotifBadge() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    const sideBadge = document.getElementById('sideNotifBadge');
    
    if(unread > 0) {
        badge.innerText = unread;
        badge.style.display = 'flex';
        sideBadge.innerText = unread;
        sideBadge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
        sideBadge.style.display = 'none';
    }
}

// ───── Settings ─────
function saveSettings(e) {
    e.preventDefault();
    showToast('Company settings saved successfully', 'success');
}

// ───── Reports ─────
function downloadReport(type) {
    showToast(`Export functionality for ${type} report is available in the frontend demo.`, 'success');
}

// ───── Toasts ─────
function showToast(msg, type='info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if(type === 'success') icon = 'fa-check-circle';
    if(type === 'danger') icon = 'fa-exclamation-circle';
    if(type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ───── Charts ─────
function initCharts() {
    // Shared options
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.color = '#6b7280';
    
    const attCtx = document.getElementById('attendanceChart');
    if(attCtx) {
        new Chart(attCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [
                    {
                        label: 'Present',
                        data: [115, 118, 117, 116, 112],
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        label: 'Absent/Leave',
                        data: [13, 10, 11, 12, 16],
                        backgroundColor: '#f59e0b',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    const rAttCtx = document.getElementById('reportAttChart');
    if(rAttCtx) {
        new Chart(rAttCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                datasets: [{
                    label: 'Attendance %',
                    data: [89, 91, 93, 90, 92, 94, 91, 91.4],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
    
    const rLeaveCtx = document.getElementById('reportLeaveChart');
    if(rLeaveCtx) {
        new Chart(rLeaveCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Pending', 'Rejected'],
                datasets: [{
                    data: [32, 6, 7],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }
}
