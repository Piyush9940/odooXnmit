/**
 * report.js - Admin Reports API Module
 */

async function getAdminDashboardReport() {
    return await apiRequest("/reports/admin-dashboard", { method: "GET" });
}

async function getEmployeeSummaryReport(params = {}) {
    const query = new URLSearchParams();
    if (params.department) query.append("department", params.department);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/reports/employees${q}`, { method: "GET" });
}

async function getAttendanceSummaryReport(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/reports/attendance${q}`, { method: "GET" });
}

async function getLeaveSummaryReport(params = {}) {
    const query = new URLSearchParams();
    if (params.year) query.append("year", params.year);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/reports/leaves${q}`, { method: "GET" });
}

async function getPayrollSummaryReport(params = {}) {
    const query = new URLSearchParams();
    if (params.year) query.append("year", params.year);
    if (params.month) query.append("month", params.month);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/reports/payroll${q}`, { method: "GET" });
}

async function getDepartmentReport() {
    return await apiRequest("/reports/departments", { method: "GET" });
}

window.getAdminDashboardReport = getAdminDashboardReport;
window.getEmployeeSummaryReport = getEmployeeSummaryReport;
window.getAttendanceSummaryReport = getAttendanceSummaryReport;
window.getLeaveSummaryReport = getLeaveSummaryReport;
window.getPayrollSummaryReport = getPayrollSummaryReport;
window.getDepartmentReport = getDepartmentReport;
