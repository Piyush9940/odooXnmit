/**
 * payroll.js - Payroll Management API Module
 */

async function getMyPayroll(params = {}) {
    const query = new URLSearchParams();
    if (params.year) query.append("year", params.year);
    if (params.month) query.append("month", params.month);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/payroll/me${q}`, { method: "GET" });
}

async function getMySalarySlips() {
    return await apiRequest("/payroll/me/slips", { method: "GET" });
}

async function downloadSalarySlip(payrollId) {
    return await apiRequest(`/payroll/me/slips/${payrollId}`, { method: "GET" });
}

async function getAllPayrolls(params = {}) {
    const query = new URLSearchParams();
    if (params.employeeId) query.append("employeeId", params.employeeId);
    if (params.month) query.append("month", params.month);
    if (params.year) query.append("year", params.year);
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/payroll${q}`, { method: "GET" });
}

async function getPayrollById(payrollId) {
    return await apiRequest(`/payroll/${payrollId}`, { method: "GET" });
}

async function createPayroll(payrollData) {
    return await apiRequest("/payroll", {
        method: "POST",
        body: payrollData
    });
}

async function updatePayroll(payrollId, updateData) {
    return await apiRequest(`/payroll/${payrollId}`, {
        method: "PATCH",
        body: updateData
    });
}

async function deletePayroll(payrollId) {
    return await apiRequest(`/payroll/${payrollId}`, {
        method: "DELETE"
    });
}

window.getMyPayroll = getMyPayroll;
window.getMySalarySlips = getMySalarySlips;
window.downloadSalarySlip = downloadSalarySlip;
window.getAllPayrolls = getAllPayrolls;
window.getPayrollById = getPayrollById;
window.createPayroll = createPayroll;
window.updatePayroll = updatePayroll;
window.deletePayroll = deletePayroll;
