import mongoose from "mongoose";

import {
    ROLES,
    USER_STATUS
} from "../utils/constants.js";

const userSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [
                8,
                "Password must be at least 8 characters"
            ],
            select: false
        },

        role: {
            type: String,
            enum: {
                values: [
                    ROLES.ADMIN,
                    ROLES.EMPLOYEE
                ],
                message:
                    "Role must be admin or employee"
            },
            required: [true, "Role is required"],
            default: ROLES.EMPLOYEE,
            index: true
        },

        status: {
            type: String,
            enum: {
                values: [
                    USER_STATUS.ACTIVE,
                    USER_STATUS.INACTIVE,
                    USER_STATUS.SUSPENDED
                ],
                message:
                    "Invalid user status"
            },
            default: USER_STATUS.ACTIVE,
            index: true
        },

        emailVerified: {
            type: Boolean,
            default: false,
            index: true
        },

        lastLoginAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

/*
 * Remove sensitive fields when converting
 * MongoDB documents to JSON.
 */
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;

        return ret;
    }
});

const User = mongoose.model("User", userSchema);

export default User;