import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
            index: true
        },

        personalDetails: {
            firstName: {
                type: String,
                required: [true, "First name is required"],
                trim: true
            },

            lastName: {
                type: String,
                required: [true, "Last name is required"],
                trim: true
            },

            dateOfBirth: {
                type: Date,
                default: null
            },

            gender: {
                type: String,
                enum: [
                    "male",
                    "female",
                    "other",
                    "prefer-not-to-say"
                ],
                default: "prefer-not-to-say"
            },

            phone: {
                type: String,
                trim: true,
                default: ""
            },

            address: {
                street: {
                    type: String,
                    trim: true,
                    default: ""
                },

                city: {
                    type: String,
                    trim: true,
                    default: ""
                },

                state: {
                    type: String,
                    trim: true,
                    default: ""
                },

                postalCode: {
                    type: String,
                    trim: true,
                    default: ""
                },

                country: {
                    type: String,
                    trim: true,
                    default: "India"
                }
            },

            profilePicture: {
                url: {
                    type: String,
                    default: ""
                },

                publicId: {
                    type: String,
                    default: ""
                }
            }
        },

        jobDetails: {
            designation: {
                type: String,
                required: [true, "Designation is required"],
                trim: true
            },

            department: {
                type: String,
                required: [true, "Department is required"],
                trim: true
            },

            employmentType: {
                type: String,
                enum: [
                    "full-time",
                    "part-time",
                    "contract",
                    "intern"
                ],
                default: "full-time"
            },

            joiningDate: {
                type: Date,
                required: [true, "Joining date is required"]
            },

            reportingManager: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee",
                default: null
            },

            workLocation: {
                type: String,
                trim: true,
                default: ""
            }
        },

        salaryStructure: {
            basicSalary: {
                type: Number,
                min: 0,
                default: 0
            },

            allowances: {
                type: Number,
                min: 0,
                default: 0
            },

            deductions: {
                type: Number,
                min: 0,
                default: 0
            },

            grossSalary: {
                type: Number,
                min: 0,
                default: 0
            },

            netSalary: {
                type: Number,
                min: 0,
                default: 0
            },

            currency: {
                type: String,
                default: "INR",
                uppercase: true
            },

            effectiveFrom: {
                type: Date,
                default: null
            }
        },

        documents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Document"
            }
        ],

        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

employeeSchema.index({
    "jobDetails.department": 1
});

employeeSchema.index({
    "jobDetails.designation": 1
});

employeeSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

const Employee = mongoose.model(
    "Employee",
    employeeSchema
);

export default Employee;