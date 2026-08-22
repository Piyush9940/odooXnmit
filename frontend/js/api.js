/**
 * api.js - Central API Helper and Configuration
 * Single source of truth for API communication using native Fetch API.
 */

const API_BASE_URL = window.API_BASE_URL || "http://localhost:5000/api";

// Token & Auth storage keys
const TOKEN_KEY = "dayflow_access_token";
const REFRESH_TOKEN_KEY = "dayflow_refresh_token";
const USER_KEY = "dayflow_user";

// Auth Storage Helpers
function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

function getUser() {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setAuth(accessToken, refreshToken, user, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    clearAuth();
    if (accessToken) storage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (user) storage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

/**
 * Core apiRequest function using native Fetch API
 */
async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers = options.headers ? { ...options.headers } : {};

    // Attach JWT Access Token if present
    const token = getAccessToken();
    if (token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Handle Content-Type for non-FormData requests
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    const fetchOptions = {
        method: options.method || "GET",
        headers,
        credentials: options.credentials || "include"
    };

    if (options.body) {
        fetchOptions.body = (options.body instanceof FormData || typeof options.body === "string")
            ? options.body
            : JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Check if response is Blob (e.g. PDF salary slip or binary document download)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/pdf")) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.blob();
        }

        let data;
        const text = await response.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            data = { message: text };
        }

        if (!response.ok) {
            const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
            const err = new Error(errorMsg);
            err.status = response.status;
            err.data = data;
            
            // Handle 401 Unauthorized globally if token is invalid/expired
            if (response.status === 401 && !endpoint.includes("/auth/login")) {
                console.warn("Session expired or unauthorized. Clearing auth state.");
            }
            throw err;
        }

        return data;
    } catch (error) {
        console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
        throw error;
    }
}

// Export functions to global scope for browser vanilla JS scripts
window.API_BASE_URL = API_BASE_URL;
window.getAccessToken = getAccessToken;
window.getRefreshToken = getRefreshToken;
window.getUser = getUser;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
window.apiRequest = apiRequest;
