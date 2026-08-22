/**
 * employee.js - Employee Management API Module
 */

async function getMyProfile() {
    return await apiRequest("/employees/me", { method: "GET" });
}

async function updateMyProfile(updateData) {
    const options = {
        method: "PATCH"
    };

    if (updateData instanceof FormData) {
        options.body = updateData;
    } else {
        options.body = updateData;
    }

    return await apiRequest("/employees/me", options);
}

async function getAllEmployees(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.department) query.append("department", params.department);
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/employees${queryString}`, { method: "GET" });
}

async function getEmployeeById(employeeId) {
    return await apiRequest(`/employees/${employeeId}`, { method: "GET" });
}

async function createEmployee(employeeData) {
    return await apiRequest("/employees", {
        method: "POST",
        body: employeeData
    });
}

async function updateEmployee(employeeId, updateData) {
    const options = {
        method: "PATCH"
    };

    if (updateData instanceof FormData) {
        options.body = updateData;
    } else {
        options.body = updateData;
    }

    return await apiRequest(`/employees/${employeeId}`, options);
}

async function deleteEmployee(employeeId) {
    return await apiRequest(`/employees/${employeeId}`, {
        method: "DELETE"
    });
}

window.getMyProfile = getMyProfile;
window.updateMyProfile = updateMyProfile;
window.getAllEmployees = getAllEmployees;
window.getEmployeeById = getEmployeeById;
window.createEmployee = createEmployee;
window.updateEmployee = updateEmployee;
window.deleteEmployee = deleteEmployee;
