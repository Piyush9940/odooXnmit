import Joi from "joi";

import { ROLES } from "../utils/constants.js";

/*
|--------------------------------------------------------------------------
| Common fields
|--------------------------------------------------------------------------
*/

const email = Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email",
        "any.required": "Email is required"
    });

const password = Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
        "string.empty": "Password is required",
        "string.min":
            "Password must be at least 8 characters",
        "string.max":
            "Password cannot exceed 128 characters",
        "any.required": "Password is required"
    });

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

/*
|--------------------------------------------------------------------------
| Sign Up
|--------------------------------------------------------------------------
*/

const signupSchema = Joi.object({
    employeeId,

    email,

    password,

    role: Joi.string()
        .valid(
            ROLES.ADMIN,
            ROLES.EMPLOYEE
        )
        .required()
        .messages({
            "any.only":
                "Role must be admin or employee",
            "any.required":
                "Role is required"
        })
});

/*
|--------------------------------------------------------------------------
| Sign In
|--------------------------------------------------------------------------
*/

const loginSchema = Joi.object({
    email,

    password
});

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

const verifyEmailSchema = Joi.object({
    token: Joi.string()
        .trim()
        .min(20)
        .required()
        .messages({
            "string.empty":
                "Verification token is required",
            "string.min":
                "Invalid verification token",
            "any.required":
                "Verification token is required"
        })
});

/*
|--------------------------------------------------------------------------
| Resend Verification Email
|--------------------------------------------------------------------------
*/

const resendVerificationSchema = Joi.object({
    email
});

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

const forgotPasswordSchema = Joi.object({
    email
});

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .trim()
        .min(20)
        .required()
        .messages({
            "string.empty":
                "Reset token is required",
            "string.min":
                "Invalid reset token",
            "any.required":
                "Reset token is required"
        }),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            "string.empty":
                "New password is required",
            "string.min":
                "New password must be at least 8 characters",
            "string.max":
                "New password cannot exceed 128 characters",
            "any.required":
                "New password is required"
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only":
                "Passwords do not match",
            "any.required":
                "Confirm password is required"
        })
});

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            "string.empty":
                "Current password is required",
            "any.required":
                "Current password is required"
        }),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .required()
        .messages({
            "string.empty":
                "New password is required",
            "string.min":
                "New password must be at least 8 characters",
            "string.max":
                "New password cannot exceed 128 characters",
            "any.required":
                "New password is required"
        }),

    confirmPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only":
                "Passwords do not match",
            "any.required":
                "Confirm password is required"
        })
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    signupSchema,
    signupSchema as registerValidator,
    loginSchema,
    loginSchema as loginValidator,
    verifyEmailSchema,
    verifyEmailSchema as verifyEmailValidator,
    resendVerificationSchema,
    forgotPasswordSchema,
    forgotPasswordSchema as forgotPasswordValidator,
    resetPasswordSchema,
    resetPasswordSchema as resetPasswordValidator,
    changePasswordSchema
};
