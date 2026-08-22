/**
 * auth.js - Authentication API and State Helpers
 */

async function loginUser(email, password, remember = true) {
    const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password }
    });

    if (data.success && data.data) {
        const { accessToken, refreshToken, user } = data.data;
        setAuth(accessToken, refreshToken, user, remember);
    }
    return data;
}

async function registerUser(userData) {
    return await apiRequest("/auth/register", {
        method: "POST",
        body: userData
    });
}

async function logoutUser() {
    try {
        await apiRequest("/auth/logout", {
            method: "POST"
        });
    } catch (e) {
        console.warn("Logout API call warning:", e.message);
    } finally {
        clearAuth();
        window.location.href = "sign-in.html";
    }
}

async function fetchCurrentUser() {
    const data = await apiRequest("/auth/me", { method: "GET" });
    if (data.success && data.data) {
        const currentUser = data.data;
        const currentToken = getAccessToken();
        const currentRefresh = getRefreshToken();
        setAuth(currentToken, currentRefresh, currentUser, true);
    }
    return data;
}

async function forgotPasswordUser(email) {
    return await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email }
    });
}

async function resetPasswordUser(token, newPassword, confirmPassword) {
    return await apiRequest("/auth/reset-password", {
        method: "POST",
        body: { token, newPassword, confirmPassword }
    });
}

function isAuthenticated() {
    return !!getAccessToken();
}

function getUserRole() {
    const u = getUser();
    return u ? (u.role || "").toUpperCase() : "";
}

function isAdmin() {
    return getUserRole() === "ADMIN";
}

function isEmployee() {
    return getUserRole() === "EMPLOYEE";
}

function requireAuth(requiredRole = null) {
    if (!isAuthenticated()) {
        window.location.href = "sign-in.html";
        return false;
    }
    if (requiredRole) {
        const role = getUserRole();
        if (role !== requiredRole.toUpperCase()) {
            if (role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "employee-dashboard.html";
            }
            return false;
        }
    }
    return true;
}

window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.fetchCurrentUser = fetchCurrentUser;
window.forgotPasswordUser = forgotPasswordUser;
window.resetPasswordUser = resetPasswordUser;
window.isAuthenticated = isAuthenticated;
window.getUserRole = getUserRole;
window.isAdmin = isAdmin;
window.isEmployee = isEmployee;
window.requireAuth = requireAuth;
