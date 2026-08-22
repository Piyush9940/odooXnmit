import mongoose from "mongoose";

import {
    LEAVE_TYPES,
    LEAVE_STATUS
} from "../utils/constants.js";

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee is required"],
            index: true
        },

        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            trim: true,
            uppercase: true,
            index: true
        },

        leaveType: {
            type: String,
            enum: {
                values: [
                    LEAVE_TYPES.PAID,
                    LEAVE_TYPES.SICK,
                    LEAVE_TYPES.UNPAID
                ],
                message:
                    "Leave type must be paid, sick, or unpaid"
            },
            required: [true, "Leave type is required"]
        },

        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },

        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },

        totalDays: {
            type: Number,
            required: [true, "Total leave days are required"],
            min: [1, "Leave must be at least one day"]
        },

        reason: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Reason cannot exceed 1000 characters"
            ],
            default: ""
        },

        status: {
            type: String,
            enum: {
                values: [
                    LEAVE_STATUS.PENDING,
                    LEAVE_STATUS.APPROVED,
                    LEAVE_STATUS.REJECTED
                ],
                message:
                    "Invalid leave status"
            },
            default: LEAVE_STATUS.PENDING,
            index: true
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        },

        adminComment: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Admin comment cannot exceed 1000 characters"
            ],
            default: ""
        }
    },
    {
        timestamps: true
    }
);

/*
 * Validate leave dates and calculate total days.
 */
leaveSchema.pre("validate", function (next) {
    try {
        if (!this.startDate || !this.endDate) {
            return next();
        }

        if (this.endDate < this.startDate) {
            return next(
                new Error(
                    "End date cannot be before start date"
                )
            );
        }

        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const difference =
            end.getTime() - start.getTime();

        this.totalDays =
            Math.floor(
                difference /
                    (1000 * 60 * 60 * 24)
            ) + 1;

        next();
    } catch (error) {
        next(error);
    }
});

/*
 * Automatically record who reviewed the request
 * and when the status changes to approved/rejected.
 */
leaveSchema.pre("save", function (next) {
    try {
        if (
            this.isModified("status") &&
            (
                this.status === LEAVE_STATUS.APPROVED ||
                this.status === LEAVE_STATUS.REJECTED
            )
        ) {
            if (!this.reviewedBy) {
                return next(
                    new Error(
                        "Reviewer is required when approving or rejecting leave"
                    )
                );
            }

            if (!this.reviewedAt) {
                this.reviewedAt = new Date();
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

leaveSchema.index({
    employee: 1,
    startDate: 1,
    endDate: 1
});

leaveSchema.index({
    status: 1,
    createdAt: -1
});

leaveSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

const Leave = mongoose.model(
    "Leave",
    leaveSchema
);

export default Leave;