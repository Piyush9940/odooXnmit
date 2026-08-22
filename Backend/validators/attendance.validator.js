import Joi from "joi";

import {
    ATTENDANCE_STATUS
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
        "any.required": "Employee ID is required"
    });

const optionalEmployeeId = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^EMP\d{3,}$/)
    .messages({
        "string.pattern.base":
            "Employee ID must follow the format EMP001"
    });

const date = Joi.date()
    .iso()
    .required()
    .messages({
        "date.base": "Invalid attendance date",
        "date.format":
            "Attendance date must be in valid ISO format",
        "any.required":
            "Attendance date is required"
    });

/*
|--------------------------------------------------------------------------
| Check In
|--------------------------------------------------------------------------
|
| Employee does not send checkIn time.
| Backend uses the server time.
|
*/

const checkInSchema = Joi.object({
    remarks: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Check Out
|--------------------------------------------------------------------------
|
| Employee does not send checkOut time.
| Backend uses the server time.
|
*/

const checkOutSchema = Joi.object({
    remarks: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Create Attendance
|--------------------------------------------------------------------------
|
| Used by Admin when manually creating an
| attendance record.
|
*/

const createAttendanceSchema = Joi.object({
    employeeId,

    date,

    status: Joi.string()
        .valid(
            ATTENDANCE_STATUS.PRESENT,
            ATTENDANCE_STATUS.ABSENT,
            ATTENDANCE_STATUS.HALF_DAY,
            ATTENDANCE_STATUS.LEAVE
        )
        .required()
        .messages({
            "any.only":
                "Invalid attendance status",
            "any.required":
                "Attendance status is required"
        }),

    checkIn: Joi.date()
        .iso()
        .allow(null)
        .default(null),

    checkOut: Joi.date()
        .iso()
        .allow(null)
        .default(null),

    remarks: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Update Attendance
|--------------------------------------------------------------------------
|
| Used by Admin.
|
*/

const updateAttendanceSchema = Joi.object({
    status: Joi.string()
        .valid(
            ATTENDANCE_STATUS.PRESENT,
            ATTENDANCE_STATUS.ABSENT,
            ATTENDANCE_STATUS.HALF_DAY,
            ATTENDANCE_STATUS.LEAVE
        )
        .optional(),

    checkIn: Joi.date()
        .iso()
        .allow(null),

    checkOut: Joi.date()
        .iso()
        .allow(null),

    remarks: Joi.string()
        .trim()
        .max(500)
        .allow("")
}).min(1);

/*
|--------------------------------------------------------------------------
| Attendance Query
|--------------------------------------------------------------------------
|
| Used for Admin attendance dashboard.
|
*/

const attendanceQuerySchema = Joi.object({
    employeeId: optionalEmployeeId,

    date: Joi.date()
        .iso()
        .optional()
        .messages({
            "date.base":
                "Invalid attendance date",
            "date.format":
                "Date must be in valid ISO format"
        }),

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

    status: Joi.string()
        .valid(
            ATTENDANCE_STATUS.PRESENT,
            ATTENDANCE_STATUS.ABSENT,
            ATTENDANCE_STATUS.HALF_DAY,
            ATTENDANCE_STATUS.LEAVE
        ),

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
| Weekly Attendance Query
|--------------------------------------------------------------------------
*/

const weeklyAttendanceSchema = Joi.object({
    employeeId: optionalEmployeeId,

    weekStart: Joi.date()
        .iso()
        .optional()
        .messages({
            "date.base":
                "Invalid week start date",
            "date.format":
                "Week start must be in valid ISO format"
        })
});

/*
|--------------------------------------------------------------------------
| Attendance ID Params
|--------------------------------------------------------------------------
*/

const attendanceIdParamSchema = Joi.object({
    attendanceId: Joi.string()
        .trim()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex":
                "Invalid attendance ID",
            "string.length":
                "Invalid attendance ID",
            "any.required":
                "Attendance ID is required"
        })
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    checkInSchema,
    checkOutSchema,
    createAttendanceSchema,
    updateAttendanceSchema,
    attendanceQuerySchema,
    weeklyAttendanceSchema,
    attendanceIdParamSchema
};