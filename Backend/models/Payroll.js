import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
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

        payrollMonth: {
            type: Number,
            required: [true, "Payroll month is required"],
            min: [1, "Payroll month must be between 1 and 12"],
            max: [12, "Payroll month must be between 1 and 12"]
        },

        payrollYear: {
            type: Number,
            required: [true, "Payroll year is required"],
            min: [2000, "Invalid payroll year"]
        },

        salaryStructure: {
            basicSalary: {
                type: Number,
                required: true,
                min: 0
            },

            allowances: {
                type: Number,
                default: 0,
                min: 0
            },

            deductions: {
                type: Number,
                default: 0,
                min: 0
            },

            grossSalary: {
                type: Number,
                required: true,
                min: 0
            },

            netSalary: {
                type: Number,
                required: true,
                min: 0
            },

            currency: {
                type: String,
                default: "INR",
                uppercase: true,
                trim: true
            }
        },

        attendanceSummary: {
            workingDays: {
                type: Number,
                default: 0,
                min: 0
            },

            presentDays: {
                type: Number,
                default: 0,
                min: 0
            },

            absentDays: {
                type: Number,
                default: 0,
                min: 0
            },

            leaveDays: {
                type: Number,
                default: 0,
                min: 0
            },

            halfDays: {
                type: Number,
                default: 0,
                min: 0
            }
        },

        status: {
            type: String,
            enum: {
                values: [
                    "draft",
                    "processed",
                    "paid"
                ],
                message:
                    "Status must be draft, processed, or paid"
            },
            default: "draft",
            index: true
        },

        processedAt: {
            type: Date,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        salarySlip: {
            url: {
                type: String,
                default: ""
            },

            publicId: {
                type: String,
                default: ""
            }
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

/*
 * Only one payroll record is allowed
 * for an employee for a particular month/year.
 */
payrollSchema.index(
    {
        employee: 1,
        payrollMonth: 1,
        payrollYear: 1
    },
    {
        unique: true
    }
);

payrollSchema.index({
    payrollYear: 1,
    payrollMonth: 1
});

payrollSchema.pre("save", function () {
    const {
        basicSalary = 0,
        allowances = 0,
        deductions = 0
    } = this.salaryStructure;

    const grossSalary =
        basicSalary + allowances;

    const netSalary =
        grossSalary - deductions;

    if (netSalary < 0) {
        throw new Error("Net salary cannot be negative");
    }

    this.salaryStructure.grossSalary =
        Number(grossSalary.toFixed(2));

    this.salaryStructure.netSalary =
        Number(netSalary.toFixed(2));

    if (
        this.isModified("status") &&
        this.status === "processed"
    ) {
        if (!this.processedAt) {
            this.processedAt = new Date();
        }
    }

    if (
        this.isModified("status") &&
        this.status === "paid"
    ) {
        if (!this.paidAt) {
            this.paidAt = new Date();
        }
    }
});

payrollSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

const Payroll = mongoose.model(
    "Payroll",
    payrollSchema
);

export default Payroll;