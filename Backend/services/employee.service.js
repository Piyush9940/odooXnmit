import User from "../models/User.js";
import Employee from "../models/Employee.js";

import {
    uploadProfilePicture,
    deleteImage
} from "./cloudinary.service.js";

/*
|--------------------------------------------------------------------------
| Helper: Normalize Employee ID
|--------------------------------------------------------------------------
*/

const normalizeEmployeeId = (employeeId) => {
    return employeeId
        ?.trim()
        .toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Get Employee Profile
|--------------------------------------------------------------------------
|
| Used by both Admin and Employee.
|
*/

const getEmployeeById = async (
    employeeId
) => {
    const normalizedEmployeeId =
        normalizeEmployeeId(employeeId);

    const employee =
        await Employee.findOne({
            employeeId:
                normalizedEmployeeId
        }).populate({
            path: "user",
            select:
                "email role emailVerified isActive lastLoginAt"
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    return employee;
};

/*
|--------------------------------------------------------------------------
| Get Employee By User ID
|--------------------------------------------------------------------------
|
| Used for Employee's own profile.
|
*/

const getEmployeeByUserId = async (
    userId
) => {
    const employee =
        await Employee.findOne({
            user: userId
        }).populate({
            path: "user",
            select:
                "email role emailVerified isActive lastLoginAt"
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    return employee;
};

/*
|--------------------------------------------------------------------------
| Get All Employees
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const getAllEmployees = async ({
    page = 1,
    limit = 10,
    search,
    department,
    status
} = {}) => {
    const pageNumber =
        Number(page);

    const limitNumber =
        Number(limit);

    const skip =
        (pageNumber - 1) *
        limitNumber;

    const filter = {};

    /*
     * Search employee by name,
     * employee ID or email.
     */
    if (search) {
        const searchRegex =
            new RegExp(
                search.trim(),
                "i"
            );

        filter.$or = [
            {
                employeeId:
                    searchRegex
            },
            { "personalDetails.firstName": searchRegex },
            { "personalDetails.lastName": searchRegex }
        ];
    }

    if (department) {
        filter["jobDetails.department"] = department.trim();
    }

    if (status) {
        filter.status =
            status;
    }

    const [
        employees,
        total
    ] = await Promise.all([
        Employee.find(filter)
            .populate({
                path: "user",
                select:
                    "email role emailVerified isActive"
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limitNumber),

        Employee.countDocuments(
            filter
        )
    ]);

    return {
        employees,

        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages:
                Math.ceil(
                    total /
                    limitNumber
                )
        }
    };
};

/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
|
| Admin only.
|
| This creates:
|
| User
|   +
| Employee profile
|
*/

const createEmployee = async ({
    employeeId,
    email,
    password,
    personalDetails,
    jobDetails,
    salaryStructure
}) => {
    const normalizedEmployeeId =
        normalizeEmployeeId(
            employeeId
        );

    const normalizedEmail =
        email
            ?.trim()
            .toLowerCase();

    /*
     * Check duplicate User.
     */
    const existingUser =
        await User.findOne({
            $or: [
                {
                    employeeId:
                        normalizedEmployeeId
                },
                {
                    email:
                        normalizedEmail
                }
            ]
        });

    if (existingUser) {
        if (
            existingUser.employeeId ===
            normalizedEmployeeId
        ) {
            throw new Error(
                "Employee ID already exists"
            );
        }

        throw new Error(
            "Email already exists"
        );
    }

    /*
     * Create User.
     *
     * Password hashing should be handled
     * by User.js middleware or password utility,
     * depending on your existing model.
     */
    const user =
        await User.create({
            employeeId:
                normalizedEmployeeId,

            email:
                normalizedEmail,

            password,

            role: "employee",

            emailVerified: false,

            isActive: true
        });

    try {
        /*
         * Create Employee profile.
         */
        const employee =
            await Employee.create({
                user: user._id,

                employeeId:
                    normalizedEmployeeId,

                personalDetails,

                jobDetails,

                salaryStructure
            });

        return await Employee
            .findById(employee._id)
            .populate({
                path: "user",
                select:
                    "email role emailVerified isActive"
            });
    } catch (error) {
        /*
         * Roll back User if Employee creation
         * fails.
         */
        await User.findByIdAndDelete(
            user._id
        );

        throw new Error(
            `Failed to create employee: ${error.message}`
        );
    }
};

/*
|--------------------------------------------------------------------------
| Update Employee
|--------------------------------------------------------------------------
|
| Admin can update all editable employee
| profile fields.
|
*/

const updateEmployee = async (
    employeeId,
    updateData
) => {
    const normalizedEmployeeId =
        normalizeEmployeeId(
            employeeId
        );

    const employee =
        await Employee.findOne({
            employeeId:
                normalizedEmployeeId
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    /*
     * Prevent changing protected fields
     * through this service.
     */
    const protectedFields = [
        "_id",
        "user",
        "employeeId",
        "createdAt",
        "updatedAt"
    ];

    for (
        const field of protectedFields
    ) {
        delete updateData[field];
    }

    /*
     * Update Employee profile.
     */
    Object.assign(
        employee,
        updateData
    );

    await employee.save();

    return getEmployeeById(
        normalizedEmployeeId
    );
};

/*
|--------------------------------------------------------------------------
| Update Own Profile
|--------------------------------------------------------------------------
|
| Employee can only update limited fields.
|
*/

const updateOwnProfile = async (
    userId,
    updateData
) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    /*
     * Only these fields can be modified
     * by the Employee.
     */
    const allowedFields = [
        "phone",
        "address"
    ];

    const filteredData = {};

    for (
        const field of allowedFields
    ) {
        if (
            updateData[field] !==
            undefined
        ) {
            filteredData[field] =
                updateData[field];
        }
    }

    Object.assign(
        employee,
        filteredData
    );

    await employee.save();

    return getEmployeeByUserId(
        userId
    );
};

/*
|--------------------------------------------------------------------------
| Upload Profile Picture
|--------------------------------------------------------------------------
|
| Employee can upload their own picture.
|
*/

const uploadEmployeeProfilePicture = async ({
    userId,
    file
}) => {
    if (!file) {
        throw new Error(
            "Profile picture is required"
        );
    }

    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const result =
        await uploadProfilePicture(
            file.buffer,
            employee.employeeId
        );

    /*
     * Delete previous profile picture
     * after successful new upload.
     */
    if (
        employee.profilePicture?.publicId
    ) {
        try {
            await deleteImage(
                employee.profilePicture
                    .publicId
            );
        } catch (error) {
            /*
             * Do not fail the entire request
             * because old image cleanup failed.
             */
            console.error(
                "Failed to delete old profile picture:",
                error.message
            );
        }
    }

    employee.profilePicture = {
        url: result.secure_url,
        publicId: result.public_id
    };

    await employee.save();

    return employee;
};

/*
|--------------------------------------------------------------------------
| Admin Upload Employee Profile Picture
|--------------------------------------------------------------------------
*/

const uploadEmployeeProfilePictureByAdmin =
    async ({
        employeeId,
        file
    }) => {
        if (!file) {
            throw new Error(
                "Profile picture is required"
            );
        }

        const employee =
            await Employee.findOne({
                employeeId:
                    normalizeEmployeeId(
                        employeeId
                    )
            });

        if (!employee) {
            throw new Error(
                "Employee not found"
            );
        }

        const result =
            await uploadProfilePicture(
                file.buffer,
                employee.employeeId
            );

        /*
         * Delete previous picture after
         * successful upload.
         */
        if (
            employee.profilePicture
                ?.publicId
        ) {
            try {
                await deleteImage(
                    employee.profilePicture
                        .publicId
                );
            } catch (error) {
                console.error(
                    "Failed to delete old profile picture:",
                    error.message
                );
            }
        }

        employee.profilePicture = {
            url: result.secure_url,
            publicId: result.public_id
        };

        await employee.save();

        return employee;
    };

/*
|--------------------------------------------------------------------------
| Activate Employee
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const activateEmployee = async (
    employeeId
) => {
    const employee =
        await Employee.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                )
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    const user =
        await User.findById(
            employee.user
        );

    if (!user) {
        throw new Error(
            "Employee user account not found"
        );
    }

    user.isActive = true;

    await user.save();

    /*
     * If Employee.js contains status,
     * keep it synchronized.
     */
    if (
        Object.prototype.hasOwnProperty.call(
            employee.toObject(),
            "status"
        )
    ) {
        employee.status =
            "active";

        await employee.save();
    }

    return getEmployeeById(
        employee.employeeId
    );
};

/*
|--------------------------------------------------------------------------
| Deactivate Employee
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const deactivateEmployee = async (
    employeeId
) => {
    const employee =
        await Employee.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                )
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    const user =
        await User.findById(
            employee.user
        );

    if (!user) {
        throw new Error(
            "Employee user account not found"
        );
    }

    user.isActive = false;

    await user.save();

    if (
        Object.prototype.hasOwnProperty.call(
            employee.toObject(),
            "status"
        )
    ) {
        employee.status =
            "inactive";

        await employee.save();
    }

    return getEmployeeById(
        employee.employeeId
    );
};

/*
|--------------------------------------------------------------------------
| Delete Employee
|--------------------------------------------------------------------------
|
| Admin only.
|
| Prefer deactivation instead of hard deletion
| for HR records.
|
*/

const deleteEmployee = async (
    employeeId
) => {
    const employee =
        await Employee.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                )
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    /*
     * For HR systems, soft deletion/deactivation
     * is safer than permanently deleting records.
     */
    const user =
        await User.findById(
            employee.user
        );

    if (user) {
        user.isActive = false;

        await user.save();
    }

    if (
        Object.prototype.hasOwnProperty.call(
            employee.toObject(),
            "status"
        )
    ) {
        employee.status =
            "inactive";

        await employee.save();
    }

    return {
        message:
            "Employee account deactivated successfully"
    };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    getEmployeeById,
    getEmployeeByUserId,
    getEmployeeByUserId as getMyProfile,
    getAllEmployees,

    createEmployee,
    updateEmployee,
    updateOwnProfile,
    updateOwnProfile as updateMyProfile,

    uploadEmployeeProfilePicture,
    uploadEmployeeProfilePictureByAdmin,

    activateEmployee,
    deactivateEmployee,
    deleteEmployee
};
