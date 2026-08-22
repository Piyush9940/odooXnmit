/**
 * leave.js - Leave Management API Module
 */

async function applyLeave(leaveData) {
    return await apiRequest("/leaves", {
        method: "POST",
        body: leaveData
    });
}

async function getMyLeaves(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.leaveType) query.append("leaveType", params.leaveType);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/leaves/me${q}`, { method: "GET" });
}

async function getLeaveById(leaveId) {
    return await apiRequest(`/leaves/${leaveId}`, { method: "GET" });
}

async function cancelLeave(leaveId) {
    return await apiRequest(`/leaves/${leaveId}/cancel`, {
        method: "PATCH"
    });
}

async function getAllLeaves(params = {}) {
    const query = new URLSearchParams();
    if (params.employeeId) query.append("employeeId", params.employeeId);
    if (params.status) query.append("status", params.status);
    if (params.leaveType) query.append("leaveType", params.leaveType);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/leaves${q}`, { method: "GET" });
}

async function approveLeave(leaveId, comment = "") {
    return await apiRequest(`/leaves/${leaveId}/approve`, {
        method: "PATCH",
        body: { adminComment: comment, comment }
    });
}

async function rejectLeave(leaveId, comment = "") {
    return await apiRequest(`/leaves/${leaveId}/reject`, {
        method: "PATCH",
        body: { adminComment: comment, comment }
    });
}

window.applyLeave = applyLeave;
window.getMyLeaves = getMyLeaves;
window.getLeaveById = getLeaveById;
window.cancelLeave = cancelLeave;
window.getAllLeaves = getAllLeaves;
window.approveLeave = approveLeave;
window.rejectLeave = rejectLeave;
