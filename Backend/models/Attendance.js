import mongoose from "mongoose";

import {
    ATTENDANCE_STATUS
} from "../utils/constants.js";

const attendanceSchema = new mongoose.Schema(
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

        date: {
            type: Date,
            required: [true, "Attendance date is required"],
            index: true
        },

        status: {
            type: String,
            enum: {
                values: [
                    ATTENDANCE_STATUS.PRESENT,
                    ATTENDANCE_STATUS.ABSENT,
                    ATTENDANCE_STATUS.HALF_DAY,
                    ATTENDANCE_STATUS.LEAVE
                ],
                message:
                    "Invalid attendance status"
            },
            required: [true, "Attendance status is required"],
            default: ATTENDANCE_STATUS.ABSENT
        },

        checkIn: {
            type: Date,
            default: null
        },

        checkOut: {
            type: Date,
            default: null
        },

        totalWorkingHours: {
            type: Number,
            min: 0,
            default: 0
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        isModifiedByAdmin: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

/*
 * One attendance record per employee per day.
 */
attendanceSchema.index(
    {
        employee: 1,
        date: 1
    },
    {
        unique: true
    }
);

/*
 * Calculate total working hours before saving.
 */
attendanceSchema.pre("save", function () {
    if (this.checkIn && this.checkOut) {
        const difference =
            this.checkOut.getTime() -
            this.checkIn.getTime();

        if (difference < 0) {
            throw new Error("Check-out time cannot be before check-in time");
        }

        this.totalWorkingHours =
            Number(
                (
                    difference /
                    (1000 * 60 * 60)
                ).toFixed(2)
            );
    }
});

attendanceSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

export default Attendance;