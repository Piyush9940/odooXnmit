import Joi from "joi";

import {
    NOTIFICATION_TYPES
} from "../utils/constants.js";

/*
|--------------------------------------------------------------------------
| Common Fields
|--------------------------------------------------------------------------
*/

const employeeId = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^EMP\d{3,}$/)
    .required()
    .messages({
        "string.empty": "Employee ID is required",
        "string.pattern.base":
            "Employee ID must follow the format EMP001",
        "any.required":
            "Employee ID is required"
    });

const optionalEmployeeId = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^EMP\d{3,}$/)
    .messages({
        "string.pattern.base":
            "Employee ID must follow the format EMP001"
    });

const notificationType = Joi.string()
    .valid(
        NOTIFICATION_TYPES.GENERAL,
        NOTIFICATION_TYPES.ATTENDANCE,
        NOTIFICATION_TYPES.LEAVE,
        NOTIFICATION_TYPES.PAYROLL,
        NOTIFICATION_TYPES.DOCUMENT,
        NOTIFICATION_TYPES.SYSTEM
    )
    .default(NOTIFICATION_TYPES.GENERAL)
    .messages({
        "any.only":
            "Invalid notification type"
    });

/*
|--------------------------------------------------------------------------
| Send Notification
|--------------------------------------------------------------------------
|
| Admin can either:
|
| 1. Send to one employee
| 2. Send to multiple employees
| 3. Send to all employees
|
| The service layer will enforce that only one
| target method is used.
|
*/

const sendNotificationSchema = Joi.object({
    employeeId: employeeId.optional(),

    employeeIds: Joi.array()
        .items(employeeId)
        .min(1)
        .max(500)
        .unique()
        .optional()
        .messages({
            "array.min":
                "At least one employee is required",
            "array.max":
                "Cannot send to more than 500 employees",
            "array.unique":
                "Duplicate employee IDs are not allowed"
        }),

    sendToAll: Joi.boolean()
        .default(false),

    type: notificationType,

    title: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required()
        .messages({
            "string.empty":
                "Notification title is required",
            "string.min":
                "Notification title must be at least 2 characters",
            "string.max":
                "Notification title cannot exceed 200 characters",
            "any.required":
                "Notification title is required"
        }),

    message: Joi.string()
        .trim()
        .min(1)
        .max(2000)
        .required()
        .messages({
            "string.empty":
                "Notification message is required",
            "string.min":
                "Notification message cannot be empty",
            "string.max":
                "Notification message cannot exceed 2000 characters",
            "any.required":
                "Notification message is required"
        }),

    emailEnabled: Joi.boolean()
        .default(true)
})
    .custom((value, helpers) => {
        const targetCount =
            Number(Boolean(value.employeeId)) +
            Number(
                Array.isArray(value.employeeIds) &&
                value.employeeIds.length > 0
            ) +
            Number(value.sendToAll === true);

        if (targetCount === 0) {
            return helpers.error(
                "any.recipient"
            );
        }

        if (targetCount > 1) {
            return helpers.error(
                "any.multipleRecipients"
            );
        }

        return value;
    })
    .messages({
        "any.recipient":
            "Provide employeeId, employeeIds, or sendToAll",
        "any.multipleRecipients":
            "Use only one notification recipient method"
    });

/*
|--------------------------------------------------------------------------
| System Notification
|--------------------------------------------------------------------------
|
| Used internally by the backend for events such as:
|
| Leave approved
| Leave rejected
| Salary slip generated
|
| Admin should normally not send these manually.
|
*/

const systemNotificationSchema = Joi.object({
    employeeId,

    type: Joi.string()
        .valid(
            NOTIFICATION_TYPES.ATTENDANCE,
            NOTIFICATION_TYPES.LEAVE,
            NOTIFICATION_TYPES.PAYROLL,
            NOTIFICATION_TYPES.DOCUMENT,
            NOTIFICATION_TYPES.SYSTEM
        )
        .required()
        .messages({
            "any.only":
                "Invalid system notification type",
            "any.required":
                "Notification type is required"
        }),

    title: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required()
        .messages({
            "string.empty":
                "Notification title is required",
            "string.min":
                "Notification title must be at least 2 characters",
            "string.max":
                "Notification title cannot exceed 200 characters",
            "any.required":
                "Notification title is required"
        }),

    message: Joi.string()
        .trim()
        .min(1)
        .max(2000)
        .required()
        .messages({
            "string.empty":
                "Notification message is required",
            "string.max":
                "Notification message cannot exceed 2000 characters",
            "any.required":
                "Notification message is required"
        }),

    referenceModel: Joi.string()
        .valid(
            "Leave",
            "Payroll",
            "Document",
            "Attendance"
        )
        .allow(null)
        .default(null),

    referenceId: Joi.string()
        .hex()
        .length(24)
        .allow(null)
        .default(null)
});

/*
|--------------------------------------------------------------------------
| Mark Notification As Read
|--------------------------------------------------------------------------
*/

const markNotificationReadSchema = Joi.object({
    read: Joi.boolean()
        .valid(true)
        .required()
        .messages({
            "any.only":
                "Notification can only be marked as read",
            "any.required":
                "Read status is required"
        })
});

/*
|--------------------------------------------------------------------------
| Notification Query
|--------------------------------------------------------------------------
*/

const notificationQuerySchema = Joi.object({
    employeeId: optionalEmployeeId,

    type: Joi.string()
        .valid(
            NOTIFICATION_TYPES.GENERAL,
            NOTIFICATION_TYPES.ATTENDANCE,
            NOTIFICATION_TYPES.LEAVE,
            NOTIFICATION_TYPES.PAYROLL,
            NOTIFICATION_TYPES.DOCUMENT,
            NOTIFICATION_TYPES.SYSTEM
        ),

    read: Joi.boolean(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
});

/*
|--------------------------------------------------------------------------
| Notification ID Params
|--------------------------------------------------------------------------
*/

const notificationIdParamSchema = Joi.object({
    notificationId: Joi.string()
        .trim()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex":
                "Invalid notification ID",
            "string.length":
                "Invalid notification ID",
            "any.required":
                "Notification ID is required"
        })
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    sendNotificationSchema,
    sendNotificationSchema as sendNotificationValidator,
    systemNotificationSchema,
    systemNotificationSchema as sendBulkNotificationValidator,
    markNotificationReadSchema,
    notificationQuerySchema,
    notificationQuerySchema as notificationQueryValidator,
    notificationIdParamSchema
};
