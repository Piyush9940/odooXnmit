/**
 * employee-dashboard.js
 * Frontend-only mock logic for the Dayflow Employee Dashboard.
 */

// ==========================================
// 1. MOCK DATA
// ==========================================

const mockUser = {
    name: "John Doe",
    empId: "EMP-001",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    dob: "12 Oct 1995",
    gender: "Male",
    address: "123 Tech Park, Whitefield, Bengaluru",
    department: "Engineering",
    designation: "Software Engineer",
    type: "Full Time",
    joiningDate: "15 Jun 2025",
    manager: "Priya Sharma",
    location: "Bengaluru",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff&size=120"
};

const mockLeaveBalances = {
    paid: 18,
    sick: 6,
    unpaid: 0
};

let mockLeaveRequests = [
    { type: "Paid Leave", start: "2026-07-10", end: "2026-07-11", days: 2, status: "Approved" },
    { type: "Sick Leave", start: "2026-05-20", end: "2026-05-20", days: 1, status: "Approved" },
    { type: "Paid Leave", start: "2026-09-01", end: "2026-09-02", days: 2, status: "Pending" }
];

let mockAttendance = [
    { date: "21 Aug 2026", checkIn: "09:05 AM", checkOut: "06:15 PM", hours: "9h 10m", status: "Present", remarks: "-" },
    { date: "20 Aug 2026", checkIn: "08:55 AM", checkOut: "06:00 PM", hours: "9h 05m", status: "Present", remarks: "-" },
    { date: "19 Aug 2026", checkIn: "09:15 AM", checkOut: "06:30 PM", hours: "9h 15m", status: "Present", remarks: "Late Check-in" },
    { date: "18 Aug 2026", checkIn: "--:--", checkOut: "--:--", hours: "0h 0m", status: "Leave", remarks: "Approved Paid Leave" },
    { date: "17 Aug 2026", checkIn: "09:00 AM", checkOut: "06:05 PM", hours: "9h 05m", status: "Present", remarks: "-" }
];

const mockPayroll = [
    { month: "July 2026", gross: "₹75,000", net: "₹66,500", status: "Paid" },
    { month: "June 2026", gross: "₹75,000", net: "₹66,500", status: "Paid" },
    { month: "May 2026", gross: "₹75,000", net: "₹66,500", status: "Paid" }
];

let mockNotifications = [
    { id: 1, title: "Leave Request Approved", msg: "Your paid leave for 10-11 July was approved.", time: "2 hours ago", icon: "fa-check-circle", read: false },
    { id: 2, title: "Payslip Generated", msg: "Your payslip for July 2026 is available.", time: "1 day ago", icon: "fa-file-invoice-dollar", read: false },
    { id: 3, title: "Company Announcement", msg: "Townhall meeting tomorrow at 10 AM.", time: "3 days ago", icon: "fa-bullhorn", read: true }
];

const mockDocuments = [
    { name: "Resume.pdf", type: "Resume", status: "Verified" },
    { name: "Aadhar_Card.jpg", type: "ID Proof", status: "Verified" },
    { name: "Rental_Agreement.pdf", type: "Address Proof", status: "Verified" },
    { name: "Offer_Letter.pdf", type: "Company Document", status: "Verified" }
];


// ==========================================
// 2. STATE
// ==========================================
let isCheckedIn = false;
let todayCheckInTime = "--:--";
let todayCheckOutTime = "--:--";

// ==========================================
// 3. INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initDate();
    initNavigation();
    initModals();
    populateDashboard();
    populateProfile();
    populateAttendance();
    populateLeave();
    populatePayroll();
    populateNotifications();
    populateDocuments();
    initChart();
    initForms();
});

function initDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    document.getElementById("currentDate").innerText = dateStr;
    document.getElementById("welcomeDate").innerText = dateStr;
}

// ==========================================
// 4. NAVIGATION & SIDEBAR
// ==========================================
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".page-section");
    const topbarTitle = document.getElementById("topbarTitle");
    const topbarDesc = document.getElementById("topbarDesc");

    const sectionMeta = {
        "dashboard": { title: "Dashboard", desc: "Here's your work overview for today." },
        "profile": { title: "My Profile", desc: "Manage your personal and job information." },
        "attendance": { title: "Attendance", desc: "Track your daily logs and working hours." },
        "leave": { title: "Leave Management", desc: "Apply for leave and view request history." },
        "payroll": { title: "Payroll & Salary", desc: "View your salary structure and payslips." },
        "notifications": { title: "Notifications", desc: "Stay updated with recent alerts." },
        "settings": { title: "Settings", desc: "Manage your account and preferences." }
    };

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove("active"));
            sections.forEach(sec => sec.classList.remove("active"));
            
            // Add active class
            item.classList.add("active");
            const targetId = item.getAttribute("data-target");
            document.getElementById(`sec-${targetId}`).classList.add("active");
            
            // Update Topbar
            topbarTitle.innerText = sectionMeta[targetId].title;
            topbarDesc.innerText = sectionMeta[targetId].desc;

            // Close mobile sidebar if open
            document.getElementById("sidebar").classList.remove("open");
        });
    });

    // View All links from dashboard
    document.querySelectorAll(".view-all").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("data-target");
            document.querySelector(`.nav-item[data-target="${target}"]`).click();
        });
    });

    // Mobile Sidebar Toggles
    document.getElementById("menuToggleBtn").addEventListener("click", () => {
        document.getElementById("sidebar").classList.add("open");
    });
    document.getElementById("mobileCloseBtn").addEventListener("click", () => {
        document.getElementById("sidebar").classList.remove("open");
    });

    // Topbar Notification Bell
    const topbarNotifBtn = document.getElementById("topbarNotifBtn");
    if(topbarNotifBtn) {
        topbarNotifBtn.addEventListener("click", () => {
            document.querySelector('.nav-item[data-target="notifications"]').click();
        });
    }
}

// ==========================================
// 5. POPULATE UI FROM MOCK DATA
// ==========================================

function populateDashboard() {
    const tbody = document.querySelector("#dashboardAttendanceTable tbody");
    tbody.innerHTML = "";
    // Only show top 4
    mockAttendance.slice(0,4).forEach(att => {
        tbody.innerHTML += `
            <tr>
                <td>${att.date}</td>
                <td>${att.checkIn}</td>
                <td>${att.checkOut}</td>
                <td><span class="status-badge ${att.status.toLowerCase().replace(' ', '-')}">${att.status}</span></td>
            </tr>
        `;
    });
}

function populateProfile() {
    // Info List mapping
    document.getElementById("profName").innerText = mockUser.name;
    document.getElementById("profDesignation").innerText = `${mockUser.designation} • ${mockUser.department}`;
    document.getElementById("profLocation").innerText = mockUser.location;
    
    document.getElementById("piName").innerText = mockUser.name;
    document.getElementById("piEmail").innerText = mockUser.email;
    document.getElementById("piPhone").innerText = mockUser.phone;
    document.getElementById("piDob").innerText = mockUser.dob;
    document.getElementById("piGender").innerText = mockUser.gender;
    document.getElementById("piAddress").innerText = mockUser.address;
    
    document.getElementById("jiId").innerText = mockUser.empId;
    document.getElementById("jiDept").innerText = mockUser.department;
    document.getElementById("jiDesig").innerText = mockUser.designation;
    document.getElementById("jiType").innerText = mockUser.type;
    document.getElementById("jiJoin").innerText = mockUser.joiningDate;
    document.getElementById("jiManager").innerText = mockUser.manager;

    // Set Avatars
    document.querySelectorAll("img[src*='ui-avatars.com']").forEach(img => {
        img.src = mockUser.avatar;
    });
}

function populateDocuments() {
    const tbody = document.getElementById("documentsTableBody");
    tbody.innerHTML = "";
    mockDocuments.forEach(doc => {
        tbody.innerHTML += `
            <tr>
                <td><i class="fas fa-file-pdf text-red mr-2"></i> ${doc.name}</td>
                <td>${doc.type}</td>
                <td><span class="status-badge success">${doc.status}</span></td>
                <td><button class="btn btn-outline btn-sm"><i class="fas fa-eye"></i> View</button></td>
            </tr>
        `;
    });
}

function populateAttendance() {
    const tbody = document.querySelector("#fullAttendanceTable tbody");
    tbody.innerHTML = "";
    mockAttendance.forEach(att => {
        tbody.innerHTML += `
            <tr>
                <td>${att.date}</td>
                <td>${att.checkIn}</td>
                <td>${att.checkOut}</td>
                <td>${att.hours}</td>
                <td><span class="status-badge ${att.status.toLowerCase().replace(' ', '-')}">${att.status}</span></td>
                <td class="text-muted">${att.remarks}</td>
            </tr>
        `;
    });
}

function populateLeave() {
    const tbody = document.querySelector("#leaveHistoryTable tbody");
    tbody.innerHTML = "";
    mockLeaveRequests.forEach(req => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${req.type}</strong></td>
                <td>${req.start} to ${req.end}</td>
                <td>${req.days} Day(s)</td>
                <td><span class="status-badge ${req.status.toLowerCase()}">${req.status}</span></td>
            </tr>
        `;
    });
}

function populatePayroll() {
    const tbody = document.querySelector("#payrollHistoryTable tbody");
    tbody.innerHTML = "";
    mockPayroll.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${p.month}</strong></td>
                <td>${p.gross}</td>
                <td><strong>${p.net}</strong></td>
                <td><button class="btn btn-outline btn-sm view-payslip"><i class="fas fa-file-invoice"></i> View</button></td>
            </tr>
        `;
    });

    document.querySelectorAll(".view-payslip").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("payslipModal").classList.add("show");
        });
    });
}

function updateNotificationBadge() {
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    const badge = document.getElementById("navNotifBadge");
    const indicator = document.getElementById("topbarIndicator");
    
    if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.style.display = "inline-block";
        indicator.style.display = "block";
    } else {
        badge.style.display = "none";
        indicator.style.display = "none";
    }
}

function populateNotifications() {
    const container = document.getElementById("fullNotificationList");
    container.innerHTML = "";
    
    if(mockNotifications.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-muted">No notifications.</div>`;
        return;
    }

    mockNotifications.forEach(n => {
        container.innerHTML += `
            <div class="notif-item ${!n.read ? 'unread' : ''}">
                <div class="notif-icon"><i class="fas ${n.icon}"></i></div>
                <div class="notif-content">
                    <h4>${n.title}</h4>
                    <p>${n.msg}</p>
                </div>
                <div class="notif-meta">${n.time}</div>
            </div>
        `;
    });
    updateNotificationBadge();
}


// ==========================================
// 6. EVENT LISTENERS & LOGIC
// ==========================================

function initForms() {
    // Check in / Check out logic
    const btnToggleAtt = document.getElementById("btnToggleAttendance");
    const btnToggleAttText = document.getElementById("btnToggleAttendanceText");
    const welcomeStatus = document.getElementById("welcomeStatus");
    const welcomeCheckIn = document.getElementById("welcomeCheckIn");
    const welcomeCheckOut = document.getElementById("welcomeCheckOut");
    const kpiTodayStatus = document.getElementById("kpiTodayStatus");

    btnToggleAtt.addEventListener("click", () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (!isCheckedIn) {
            // Check in
            isCheckedIn = true;
            todayCheckInTime = timeStr;
            welcomeCheckIn.innerText = timeStr;
            
            btnToggleAtt.classList.remove("btn-primary");
            btnToggleAtt.classList.add("btn-outline");
            btnToggleAttText.innerText = "Check Out";
            
            welcomeStatus.innerText = "Present (Working)";
            welcomeStatus.className = "w-val status-badge present";
            
            kpiTodayStatus.innerText = "Present";
            kpiTodayStatus.style.color = "var(--success)";
            
            showToast("Success", "You have successfully checked in.", "success");
        } else {
            // Check out
            todayCheckOutTime = timeStr;
            welcomeCheckOut.innerText = timeStr;
            
            btnToggleAtt.disabled = true;
            btnToggleAttText.innerText = "Shift Completed";
            
            welcomeStatus.innerText = "Shift Completed";
            welcomeStatus.className = "w-val status-badge default";
            
            showToast("Success", "You have successfully checked out.", "success");
        }
    });

    // Leave Application Calculation
    const startInput = document.getElementById("leaveStart");
    const endInput = document.getElementById("leaveEnd");
    const durationInput = document.getElementById("leaveDuration");

    function calcLeave() {
        if(startInput.value && endInput.value) {
            const start = new Date(startInput.value);
            const end = new Date(endInput.value);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
            
            if (end < start) {
                durationInput.value = "Invalid Date Range";
            } else {
                durationInput.value = diffDays + " Day(s)";
            }
        }
    }
    startInput.addEventListener("change", calcLeave);
    endInput.addEventListener("change", calcLeave);

    // Leave Application Submit
    document.getElementById("applyLeaveForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const type = document.getElementById("leaveType").value;
        const start = startInput.value;
        const end = endInput.value;
        const daysStr = durationInput.value;
        const days = parseInt(daysStr);

        if(isNaN(days)) {
            showToast("Error", "Please select valid dates.", "error");
            return;
        }

        // Add to mock data
        mockLeaveRequests.unshift({
            type: type,
            start: start,
            end: end,
            days: days,
            status: "Pending"
        });

        // Re-render
        populateLeave();
        
        // Reset form
        e.target.reset();
        durationInput.value = "0 Days";
        
        // Update pending KPI
        const pendingCount = mockLeaveRequests.filter(r => r.status === "Pending").length;
        document.getElementById("kpiPendingLeaves").innerText = pendingCount;
        
        showToast("Leave Applied", "Your leave request has been submitted for approval.", "success");
    });

    // Mark All Read
    document.getElementById("btnMarkAllRead").addEventListener("click", () => {
        mockNotifications.forEach(n => n.read = true);
        populateNotifications();
        showToast("Success", "All notifications marked as read.", "success");
    });

    // Edit Profile Modal
    document.getElementById("btnEditProfile").addEventListener("click", () => {
        document.getElementById("editProfileModal").classList.add("show");
    });

    document.getElementById("editProfileForm").addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Update mock data
        mockUser.email = document.getElementById("epEmail").value;
        mockUser.phone = document.getElementById("epPhone").value;
        mockUser.address = document.getElementById("epAddress").value;
        
        populateProfile();
        document.getElementById("editProfileModal").classList.remove("show");
        showToast("Success", "Profile information updated.", "success");
    });

    // Settings Forms
    document.getElementById("settingsAccountForm").addEventListener("submit", (e) => {
        e.preventDefault();
        e.target.reset();
        showToast("Success", "Password updated successfully.", "success");
    });
    document.getElementById("settingsPrefsForm").addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Success", "Notification preferences saved.", "success");
    });
}


// ==========================================
// 7. MODALS
// ==========================================
function initModals() {
    const modals = document.querySelectorAll(".modal-overlay");
    const closeBtns = document.querySelectorAll(".modal-close, .modal-close-btn");

    closeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            modals.forEach(m => m.classList.remove("show"));
        });
    });

    // Close on click outside
    modals.forEach(m => {
        m.addEventListener("click", (e) => {
            if (e.target === m) {
                m.classList.remove("show");
            }
        });
    });
}

// ==========================================
// 8. TOAST NOTIFICATIONS
// ==========================================
function showToast(title, message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-msg">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 9. CHART.JS
// ==========================================
function initChart() {
    const ctx = document.getElementById('attendanceChart');
    if(!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Leave', 'Half Day'],
            datasets: [{
                data: [22, 1, 2, 0],
                backgroundColor: [
                    '#10b981', // green (Present)
                    '#ef4444', // red (Absent)
                    '#7c3aed', // purple (Leave)
                    '#f59e0b'  // orange (Half day)
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { family: "'Inter', sans-serif" }
                    }
                }
            }
        }
    });
}
