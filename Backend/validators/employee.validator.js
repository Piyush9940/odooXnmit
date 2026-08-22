import Joi from "joi";

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

const phone = Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
        "string.pattern.base":
            "Please provide a valid 10-digit Indian phone number"
    });

const dateOfBirth = Joi.date()
    .iso()
    .max("now")
    .messages({
        "date.format":
            "Date of birth must be a valid date",
        "date.max":
            "Date of birth cannot be in the future"
    });

/*
|--------------------------------------------------------------------------
| Personal Details
|--------------------------------------------------------------------------
*/

const personalDetailsSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty":
                "First name is required",
            "string.min":
                "First name must be at least 2 characters",
            "string.max":
                "First name cannot exceed 50 characters",
            "any.required":
                "First name is required"
        }),

    lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
        .messages({
            "string.empty":
                "Last name is required",
            "string.max":
                "Last name cannot exceed 50 characters",
            "any.required":
                "Last name is required"
        }),

    dateOfBirth,

    gender: Joi.string()
        .valid(
            "male",
            "female",
            "other",
            "prefer-not-to-say"
        )
        .default("prefer-not-to-say"),

    phone,

    address: Joi.object({
        street: Joi.string()
            .trim()
            .max(200)
            .allow("")
            .default(""),

        city: Joi.string()
            .trim()
            .max(100)
            .allow("")
            .default(""),

        state: Joi.string()
            .trim()
            .max(100)
            .allow("")
            .default(""),

        postalCode: Joi.string()
            .trim()
            .pattern(/^\d{6}$/)
            .allow("")
            .messages({
                "string.pattern.base":
                    "Postal code must be a valid 6-digit PIN code"
            }),

        country: Joi.string()
            .trim()
            .max(100)
            .default("India")
    }).default({})
});

/*
|--------------------------------------------------------------------------
| Job Details
|--------------------------------------------------------------------------
*/

const jobDetailsSchema = Joi.object({
    designation: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty":
                "Designation is required",
            "string.min":
                "Designation must be at least 2 characters",
            "string.max":
                "Designation cannot exceed 100 characters",
            "any.required":
                "Designation is required"
        }),

    department: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty":
                "Department is required",
            "string.min":
                "Department must be at least 2 characters",
            "string.max":
                "Department cannot exceed 100 characters",
            "any.required":
                "Department is required"
        }),

    employmentType: Joi.string()
        .valid(
            "full-time",
            "part-time",
            "contract",
            "intern"
        )
        .default("full-time"),

    joiningDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.format":
                "Joining date must be a valid date",
            "any.required":
                "Joining date is required"
        }),

    reportingManager: Joi.string()
        .trim()
        .allow(null, "")
        .default(null),

    workLocation: Joi.string()
        .trim()
        .max(200)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Salary Structure
|--------------------------------------------------------------------------
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

    grossSalary: Joi.number()
        .min(0)
        .optional(),

    netSalary: Joi.number()
        .min(0)
        .optional(),

    currency: Joi.string()
        .trim()
        .uppercase()
        .length(3)
        .default("INR"),

    effectiveFrom: Joi.date()
        .iso()
        .optional()
        .allow(null)
});

/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
*/

const createEmployeeSchema = Joi.object({
    employeeId,

    personalDetails:
        personalDetailsSchema.required(),

    jobDetails:
        jobDetailsSchema.required(),

    salaryStructure:
        salaryStructureSchema.required()
});

/*
|--------------------------------------------------------------------------
| Employee Self Profile Update
|--------------------------------------------------------------------------
|
| Employee is allowed to edit only:
| - Phone
| - Address
| - Profile picture is handled separately
|
*/

const updateOwnProfileSchema = Joi.object({
    personalDetails: Joi.object({
        phone,

        address: Joi.object({
            street: Joi.string()
                .trim()
                .max(200)
                .allow(""),

            city: Joi.string()
                .trim()
                .max(100)
                .allow(""),

            state: Joi.string()
                .trim()
                .max(100)
                .allow(""),

            postalCode: Joi.string()
                .trim()
                .pattern(/^\d{6}$/)
                .allow("")
                .messages({
                    "string.pattern.base":
                        "Postal code must be a valid 6-digit PIN code"
                }),

            country: Joi.string()
                .trim()
                .max(100)
                .allow("")
        }).min(1)
    })
        .min(1)
        .required()
});

/*
|--------------------------------------------------------------------------
| Admin Employee Update
|--------------------------------------------------------------------------
*/

const updateEmployeeSchema = Joi.object({
    personalDetails:
        personalDetailsSchema.optional(),

    jobDetails:
        jobDetailsSchema.optional(),

    salaryStructure:
        salaryStructureSchema.optional()
}).min(1);

/*
|--------------------------------------------------------------------------
| Employee List Query
|--------------------------------------------------------------------------
*/

const employeeQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    search: Joi.string()
        .trim()
        .max(100)
        .allow(""),

    department: Joi.string()
        .trim()
        .max(100)
        .allow(""),

    designation: Joi.string()
        .trim()
        .max(100)
        .allow(""),

    employmentType: Joi.string()
        .valid(
            "full-time",
            "part-time",
            "contract",
            "intern"
        ),

    isActive: Joi.boolean()
});

/*
|--------------------------------------------------------------------------
| Employee ID Params
|--------------------------------------------------------------------------
*/

const employeeIdParamSchema = Joi.object({
    employeeId: optionalEmployeeId
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    createEmployeeSchema,
    updateOwnProfileSchema,
    updateEmployeeSchema,
    employeeQuerySchema,
    employeeIdParamSchema
};