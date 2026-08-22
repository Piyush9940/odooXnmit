const ROLES = Object.freeze({
    ADMIN: "admin",
    EMPLOYEE: "employee"
});

const USER_STATUS = Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended"
});

const LEAVE_TYPES = Object.freeze({
    PAID: "paid",
    SICK: "sick",
    UNPAID: "unpaid"
});

const LEAVE_STATUS = Object.freeze({
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected"
});

const ATTENDANCE_STATUS = Object.freeze({
    PRESENT: "present",
    ABSENT: "absent",
    HALF_DAY: "half-day",
    LEAVE: "leave"
});

const PAYROLL_STATUS = Object.freeze({
    DRAFT: "draft",
    PROCESSED: "processed",
    PAID: "paid"
});

const DOCUMENT_TYPES = Object.freeze({
    OFFER_LETTER: "offer-letter",
    EXPERIENCE_LETTER: "experience-letter",
    ID_PROOF: "id-proof",
    CERTIFICATE: "certificate",
    OTHER: "other"
});

const NOTIFICATION_TYPES = Object.freeze({
    GENERAL: "general",
    ATTENDANCE: "attendance",
    LEAVE: "leave",
    PAYROLL: "payroll",
    DOCUMENT: "document",
    SYSTEM: "system"
});

const NOTIFICATION_RECIPIENT_TYPES = Object.freeze({
    EMPLOYEE: "employee",
    ALL: "all"
});

const EMAIL_TYPES = Object.freeze({
    VERIFY_EMAIL: "verify-email",
    WELCOME: "welcome",
    RESET_PASSWORD: "reset-password",
    LEAVE_APPROVED: "leave-approved",
    LEAVE_REJECTED: "leave-rejected",
    SALARY_SLIP: "salary-slip",
    ADMIN_NOTIFICATION: "admin-notification"
});

const TOKEN_TYPES = Object.freeze({
    EMAIL_VERIFICATION: "email-verification",
    PASSWORD_RESET: "password-reset"
});

const FILE_TYPES = Object.freeze({
    PROFILE: "profile",
    DOCUMENT: "document",
    SALARY_SLIP: "salary-slip"
});

const FILE_SIZE = Object.freeze({
    MAX_PROFILE_SIZE: 5 * 1024 * 1024,
    MAX_DOCUMENT_SIZE: 5 * 1024 * 1024,
    MAX_SALARY_SLIP_SIZE: 5 * 1024 * 1024
});

const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
});

const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
});

const DEFAULTS = Object.freeze({
    JWT_EXPIRES_IN: "1d",
    EMAIL_VERIFICATION_EXPIRES_MINUTES: 30,
    PASSWORD_RESET_EXPIRES_MINUTES: 15
});

export {
    ROLES,
    USER_STATUS,
    LEAVE_TYPES,
    LEAVE_STATUS,
    ATTENDANCE_STATUS,
    PAYROLL_STATUS,
    DOCUMENT_TYPES,
    NOTIFICATION_TYPES,
    NOTIFICATION_RECIPIENT_TYPES,
    EMAIL_TYPES,
    TOKEN_TYPES,
    FILE_TYPES,
    FILE_SIZE,
    PAGINATION,
    HTTP_STATUS,
    DEFAULTS
};
