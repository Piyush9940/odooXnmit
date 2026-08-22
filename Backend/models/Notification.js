import mongoose from "mongoose";

import {
    NOTIFICATION_TYPES
} from "../utils/constants.js";

const notificationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Notification sender is required"],
            index: true
        },

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
            index: true
        },

        recipientEmployeeId: {
            type: String,
            trim: true,
            uppercase: true,
            default: null,
            index: true
        },

        /*
         * If true, this notification was sent
         * to every active employee.
         */
        sendToAll: {
            type: Boolean,
            default: false,
            index: true
        },

        type: {
            type: String,
            enum: {
                values: [
                    NOTIFICATION_TYPES.GENERAL,
                    NOTIFICATION_TYPES.ATTENDANCE,
                    NOTIFICATION_TYPES.LEAVE,
                    NOTIFICATION_TYPES.PAYROLL,
                    NOTIFICATION_TYPES.DOCUMENT,
                    NOTIFICATION_TYPES.SYSTEM
                ],
                message: "Invalid notification type"
            },
            required: [true, "Notification type is required"],
            default: NOTIFICATION_TYPES.GENERAL,
            index: true
        },

        title: {
            type: String,
            required: [true, "Notification title is required"],
            trim: true,
            maxlength: 200
        },

        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true,
            maxlength: 2000
        },

        /*
         * Optional reference to another Dayflow resource.
         *
         * Example:
         * Leave notification → leave ID
         * Payroll notification → payroll ID
         * Document notification → document ID
         */
        reference: {
            model: {
                type: String,
                enum: [
                    "Leave",
                    "Payroll",
                    "Document",
                    "Attendance",
                    null
                ],
                default: null
            },

            id: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            }
        },

        email: {
            enabled: {
                type: Boolean,
                default: true
            },

            status: {
                type: String,
                enum: [
                    "pending",
                    "sent",
                    "failed",
                    "not-sent"
                ],
                default: "pending"
            },

            sentAt: {
                type: Date,
                default: null
            },

            error: {
                type: String,
                default: null
            }
        },

        read: {
            type: Boolean,
            default: false,
            index: true
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

/*
 * Employee notification listing.
 */
notificationSchema.index({
    recipient: 1,
    createdAt: -1
});

/*
 * Unread notifications.
 */
notificationSchema.index({
    recipient: 1,
    read: 1,
    createdAt: -1
});

/*
 * Notification type filtering.
 */
notificationSchema.index({
    recipient: 1,
    type: 1,
    createdAt: -1
});

/*
 * Automatically set readAt when notification
 * becomes read.
 */
notificationSchema.pre("save", function (next) {
    try {
        if (
            this.isModified("read") &&
            this.read === true &&
            !this.readAt
        ) {
            this.readAt = new Date();
        }

        if (
            this.isModified("read") &&
            this.read === false
        ) {
            this.readAt = null;
        }

        next();
    } catch (error) {
        next(error);
    }
});

notificationSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;