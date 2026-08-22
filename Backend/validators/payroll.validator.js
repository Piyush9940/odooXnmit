import Joi from "joi";

import {
    PAYROLL_STATUS
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

/*
|--------------------------------------------------------------------------
| Payroll Month
|--------------------------------------------------------------------------
*/

const payrollMonth = Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
        "number.base":
            "Payroll month must be a number",
        "number.min":
            "Payroll month must be between 1 and 12",
        "number.max":
            "Payroll month must be between 1 and 12",
        "any.required":
            "Payroll month is required"
    });

/*
|--------------------------------------------------------------------------
| Payroll Year
|--------------------------------------------------------------------------
*/

const payrollYear = Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
        "number.base":
            "Payroll year must be a number",
        "number.min":
            "Invalid payroll year",
        "number.max":
            "Invalid payroll year",
        "any.required":
            "Payroll year is required"
    });

/*
|--------------------------------------------------------------------------
| Salary Structure
|--------------------------------------------------------------------------
|
| grossSalary and netSalary are intentionally NOT accepted
| from the frontend.
|
| Backend calculates:
|
| grossSalary = basicSalary + allowances
| netSalary = grossSalary - deductions
|
*/

const salaryStructureSchema = Joi.object({
    basicSalary: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base":
                "Basic salary must be a number",
            "number.min":
                "Basic salary cannot be negative",
            "any.required":
                "Basic salary is required"
        }),

    allowances: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base":
                "Allowances must be a number",
            "number.min":
                "Allowances cannot be negative"
        }),

    deductions: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base":
                "Deductions must be a number",
            "number.min":
                "Deductions cannot be negative"
        }),

    currency: Joi.string()
        .trim()
        .uppercase()
        .length(3)
        .default("INR")
        .messages({
            "string.length":
                "Currency must be a valid 3-letter code"
        })
});

/*
|--------------------------------------------------------------------------
| Attendance Summary
|--------------------------------------------------------------------------
|
| This is generated from Attendance records by the backend.
| It is not trusted from the frontend.
|
*/

const attendanceSummarySchema = Joi.object({
    workingDays: Joi.number()
        .integer()
        .min(0)
        .default(0),

    presentDays: Joi.number()
        .integer()
        .min(0)
        .default(0),

    absentDays: Joi.number()
        .integer()
        .min(0)
        .default(0),

    leaveDays: Joi.number()
        .integer()
        .min(0)
        .default(0),

    halfDays: Joi.number()
        .integer()
        .min(0)
        .default(0)
});

/*
|--------------------------------------------------------------------------
| Create Payroll
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const createPayrollSchema = Joi.object({
    employeeId,

    payrollMonth,

    payrollYear,

    salaryStructure:
        salaryStructureSchema.required(),

    remarks: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Update Payroll
|--------------------------------------------------------------------------
|
| Admin only.
|
| Only draft payroll should normally be updated.
|
*/

const updatePayrollSchema = Joi.object({
    salaryStructure:
        salaryStructureSchema.optional(),

    remarks: Joi.string()
        .trim()
        .max(1000)
        .allow(""),

    attendanceSummary:
        attendanceSummarySchema.optional()
}).min(1);

/*
|--------------------------------------------------------------------------
| Process Payroll
|--------------------------------------------------------------------------
|
| Admin finalizes a draft payroll.
|
*/

const processPayrollSchema = Joi.object({
    remarks: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Mark Payroll As Paid
|--------------------------------------------------------------------------
|
| Admin marks processed payroll as paid.
|
*/

const markPayrollPaidSchema = Joi.object({
    paymentReference: Joi.string()
        .trim()
        .max(200)
        .allow("")
        .default(""),

    remarks: Joi.string()
        .trim()
        .max(1000)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Payroll Query
|--------------------------------------------------------------------------
|
| Used by Admin for payroll dashboard.
|
*/

const payrollQuerySchema = Joi.object({
    employeeId: optionalEmployeeId,

    payrollMonth: Joi.number()
        .integer()
        .min(1)
        .max(12),

    payrollYear: Joi.number()
        .integer()
        .min(2000)
        .max(2100),

    status: Joi.string()
        .valid(
            PAYROLL_STATUS.DRAFT,
            PAYROLL_STATUS.PROCESSED,
            PAYROLL_STATUS.PAID
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
| Payroll ID Params
|--------------------------------------------------------------------------
*/

const payrollIdParamSchema = Joi.object({
    payrollId: Joi.string()
        .trim()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex":
                "Invalid payroll ID",
            "string.length":
                "Invalid payroll ID",
            "any.required":
                "Payroll ID is required"
        })
});

/*
|--------------------------------------------------------------------------
| Salary Slip Generation
|--------------------------------------------------------------------------
*/

const salarySlipSchema = Joi.object({
    payrollId: Joi.string()
        .trim()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex":
                "Invalid payroll ID",
            "string.length":
                "Invalid payroll ID",
            "any.required":
                "Payroll ID is required"
        })
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    createPayrollSchema,
    updatePayrollSchema,
    processPayrollSchema,
    markPayrollPaidSchema,
    payrollQuerySchema,
    payrollIdParamSchema,
    salarySlipSchema
};