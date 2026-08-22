import Joi from "joi";

import {
    LEAVE_TYPES,
    LEAVE_STATUS
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

const leaveType = Joi.string()
    .valid(
        LEAVE_TYPES.PAID,
        LEAVE_TYPES.SICK,
        LEAVE_TYPES.UNPAID
    )
    .required()
    .messages({
        "any.only":
            "Leave type must be paid, sick, or unpaid",
        "any.required":
            "Leave type is required"
    });

/*
|--------------------------------------------------------------------------
| Apply Leave
|--------------------------------------------------------------------------
|
| Used by Employee.
|
| totalDays is intentionally NOT accepted.
| Backend calculates it from startDate/endDate.
|
*/

const applyLeaveSchema = Joi.object({
    leaveType,

    startDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base":
                "Invalid start date",
            "date.format":
                "Start date must be in valid ISO format",
            "any.required":
                "Start date is required"
        }),

    endDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base":
                "Invalid end date",
            "date.format":
                "End date must be in valid ISO format",
            "any.required":
                "End date is required"
        }),

    reason: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .default("")
})
    .custom((value, helpers) => {
        const start = new Date(value.startDate);
        const end = new Date(value.endDate);

        if (end < start) {
            return helpers.error(
                "any.dateRange"
            );
        }

        return value;
    })
    .messages({
        "any.dateRange":
            "End date cannot be before start date"
    });

/*
|--------------------------------------------------------------------------
| Admin Approve Leave
|--------------------------------------------------------------------------
*/

const approveLeaveSchema = Joi.object({
    adminComment: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Admin Reject Leave
|--------------------------------------------------------------------------
|
| A rejection comment is required so the employee
| knows why the request was rejected.
|
*/

const rejectLeaveSchema = Joi.object({
    adminComment: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required()
        .messages({
            "string.empty":
                "Rejection comment is required",
            "string.min":
                "Rejection comment is required",
            "string.max":
                "Rejection comment cannot exceed 1000 characters",
            "any.required":
                "Rejection comment is required"
        })
});

/*
|--------------------------------------------------------------------------
| Admin Update Leave
|--------------------------------------------------------------------------
|
| Used only when the Admin needs to modify a
| pending request.
|
*/

const updateLeaveSchema = Joi.object({
    leaveType: Joi.string()
        .valid(
            LEAVE_TYPES.PAID,
            LEAVE_TYPES.SICK,
            LEAVE_TYPES.UNPAID
        ),

    startDate: Joi.date()
        .iso()
        .messages({
            "date.base":
                "Invalid start date",
            "date.format":
                "Start date must be in valid ISO format"
        }),

    endDate: Joi.date()
        .iso()
        .messages({
            "date.base":
                "Invalid end date",
            "date.format":
                "End date must be in valid ISO format"
        }),

    reason: Joi.string()
        .trim()
        .max(1000)
        .allow("")
})
    .min(1)
    .custom((value, helpers) => {
        /*
         * Date-range validation is performed here
         * only when both dates are provided.
         */
        if (
            value.startDate &&
            value.endDate
        ) {
            const start = new Date(
                value.startDate
            );

            const end = new Date(
                value.endDate
            );

            if (end < start) {
                return helpers.error(
                    "any.dateRange"
                );
            }
        }

        return value;
    })
    .messages({
        "any.dateRange":
            "End date cannot be before start date"
    });

/*
|--------------------------------------------------------------------------
| Leave Query
|--------------------------------------------------------------------------
|
| Used by Admin for leave dashboard/filtering.
|
*/

const leaveQuerySchema = Joi.object({
    employeeId: optionalEmployeeId,

    status: Joi.string()
        .valid(
            LEAVE_STATUS.PENDING,
            LEAVE_STATUS.APPROVED,
            LEAVE_STATUS.REJECTED
        ),

    leaveType: Joi.string()
        .valid(
            LEAVE_TYPES.PAID,
            LEAVE_TYPES.SICK,
            LEAVE_TYPES.UNPAID
        ),

    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
            "date.base":
                "Invalid start date",
            "date.format":
                "Start date must be in valid ISO format"
        }),

    endDate: Joi.date()
        .iso()
        .optional()
        .messages({
            "date.base":
                "Invalid end date",
            "date.format":
                "End date must be in valid ISO format"
        }),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
});

/*
|--------------------------------------------------------------------------
| Leave ID Params
|--------------------------------------------------------------------------
*/

const leaveIdParamSchema = Joi.object({
    leaveId: Joi.string()
        .trim()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex":
                "Invalid leave ID",
            "string.length":
                "Invalid leave ID",
            "any.required":
                "Leave ID is required"
        })
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    applyLeaveSchema,
    approveLeaveSchema,
    rejectLeaveSchema,
    updateLeaveSchema,
    leaveQuerySchema,
    leaveIdParamSchema
};