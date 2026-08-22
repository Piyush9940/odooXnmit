/**
 * attendance.js - Attendance Management API Module
 */

async function checkInAttendance(workMode = "office") {
    return await apiRequest("/attendance/check-in", {
        method: "POST",
        body: { workMode }
    });
}

async function checkOutAttendance() {
    return await apiRequest("/attendance/check-out", {
        method: "POST"
    });
}

async function getMyAttendance(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.status) query.append("status", params.status);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/attendance/me${q}`, { method: "GET" });
}

async function getMyAttendanceSummary(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/attendance/me/summary${q}`, { method: "GET" });
}

async function getAllAttendance(params = {}) {
    const query = new URLSearchParams();
    if (params.employeeId) query.append("employeeId", params.employeeId);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/attendance${q}`, { method: "GET" });
}

async function getEmployeeAttendance(employeeId, params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.status) query.append("status", params.status);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/attendance/employee/${employeeId}${q}`, { method: "GET" });
}

async function updateAttendance(attendanceId, data) {
    return await apiRequest(`/attendance/${attendanceId}`, {
        method: "PATCH",
        body: data
    });
}

window.checkInAttendance = checkInAttendance;
window.checkOutAttendance = checkOutAttendance;
window.getMyAttendance = getMyAttendance;
window.getMyAttendanceSummary = getMyAttendanceSummary;
window.getAllAttendance = getAllAttendance;
window.getEmployeeAttendance = getEmployeeAttendance;
window.updateAttendance = updateAttendance;
