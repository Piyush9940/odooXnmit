/**
 * document.js - Document Management API Module
 */

async function uploadDocument(formData) {
    return await apiRequest("/documents", {
        method: "POST",
        body: formData
    });
}

async function getMyDocuments(params = {}) {
    const query = new URLSearchParams();
    if (params.documentType) query.append("documentType", params.documentType);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const q = query.toString() ? `?${query.toString()}` : "";
    return await apiRequest(`/documents/me${q}`, { method: "GET" });
}

async function deleteDocument(documentId) {
    return await apiRequest(`/documents/me/${documentId}`, {
        method: "DELETE"
    });
}

window.uploadDocument = uploadDocument;
window.getMyDocuments = getMyDocuments;
window.deleteDocument = deleteDocument;
