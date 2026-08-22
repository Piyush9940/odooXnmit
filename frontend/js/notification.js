/**
 * notification.js - Notification API Module
 */

async function getMyNotifications(params = {}) {
    const query = new URLSearchParams();
    if (params.read !== undefined) query.append("read", params.read);
    if (params.type) query.append("type", params.type);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/notifications/me${q}`, { method: "GET" });
}

async function markAllNotificationsRead() {
    return await apiRequest("/notifications/me/read-all", {
        method: "PATCH"
    });
}

async function markNotificationRead(notificationId) {
    return await apiRequest(`/notifications/me/${notificationId}/read`, {
        method: "PATCH"
    });
}

async function deleteNotification(notificationId) {
    return await apiRequest(`/notifications/me/${notificationId}`, {
        method: "DELETE"
    });
}

async function sendNotificationToEmployee(employeeId, notifData) {
    return await apiRequest(`/notifications/employee/${employeeId}`, {
        method: "POST",
        body: notifData
    });
}

window.getMyNotifications = getMyNotifications;
window.markAllNotificationsRead = markAllNotificationsRead;
window.markNotificationRead = markNotificationRead;
window.deleteNotification = deleteNotification;
window.sendNotificationToEmployee = sendNotificationToEmployee;
