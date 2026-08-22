import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";

import {
    sendLeaveApprovedEmail,
    sendLeaveRejectedEmail
} from "./email.service.js";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const LEAVE_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected"
};

/*
|--------------------------------------------------------------------------
| Helper: Normalize Employee ID
|--------------------------------------------------------------------------
*/

const normalizeEmployeeId = (employeeId) => {
    return employeeId?.trim().toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Helper: Calculate Number of Days
|--------------------------------------------------------------------------
|
| Inclusive date calculation.
|
| Example:
| 2026-08-10 → 2026-08-12
| = 3 days
|
*/

const calculateLeaveDays = (
    startDate,
    endDate
) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const difference =
        end.getTime() -
        start.getTime();

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1
    );
};

/*
|--------------------------------------------------------------------------
| Helper: Get Employee
|--------------------------------------------------------------------------
*/

const getEmployee = async (
    employeeId
) => {
    const employee =
        await Employee.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                )
        }).populate({
            path: "user",
            select:
                "email role isActive"
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
| Helper: Check Date Overlap
|--------------------------------------------------------------------------
*/

const hasOverlappingLeave = async ({
    employeeId,
    startDate,
    endDate
}) => {
    const overlappingLeave =
        await Leave.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                ),

            status: {
                $in: [
                    LEAVE_STATUS.PENDING,
                    LEAVE_STATUS.APPROVED
                ]
            },

            startDate: {
                $lte: new Date(endDate)
            },

            endDate: {
                $gte: new Date(startDate)
            }
        });

    return Boolean(
        overlappingLeave
    );
};

/*
|--------------------------------------------------------------------------
| Apply Leave
|--------------------------------------------------------------------------
|
| Employee only.
|
*/

const applyLeave = async ({
    userId,
    leaveType,
    startDate,
    endDate,
    remarks
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    if (
        employee.user?.isActive ===
        false
    ) {
        throw new Error(
            "Employee account is inactive"
        );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        throw new Error(
            "Invalid leave dates"
        );
    }

    if (start > end) {
        throw new Error(
            "Start date cannot be after end date"
        );
    }

    /*
     * Prevent applying for overlapping leave.
     */
    const overlapping =
        await hasOverlappingLeave({
            employeeId:
                employee.employeeId,

            startDate: start,

            endDate: end
        });

    if (overlapping) {
        throw new Error(
            "You already have a pending or approved leave for the selected dates"
        );
    }

    const totalDays =
        calculateLeaveDays(
            start,
            end
        );

    /*
     * Create leave request.
     */
    const leave =
        await Leave.create({
            employeeId:
                employee.employeeId,

            leaveType,

            startDate: start,

            endDate: end,

            totalDays,

            remarks,

            status:
                LEAVE_STATUS.PENDING
        });

    return leave;
};

/*
|--------------------------------------------------------------------------
| Get My Leaves
|--------------------------------------------------------------------------
|
| Employee only.
|
*/

const getMyLeaves = async ({
    userId,
    page = 1,
    limit = 10,
    status,
    leaveType
} = {}) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const filter = {
        employeeId:
            employee.employeeId
    };

    if (status) {
        filter.status = status;
    }

    if (leaveType) {
        filter.leaveType =
            leaveType;
    }

    const pageNumber =
        Number(page);

    const limitNumber =
        Number(limit);

    const skip =
        (pageNumber - 1) *
        limitNumber;

    const [
        leaves,
        total
    ] = await Promise.all([
        Leave.find(filter)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limitNumber),

        Leave.countDocuments(
            filter
        )
    ]);

    return {
        leaves,

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
| Get Leave By ID
|--------------------------------------------------------------------------
*/

const getLeaveById = async (
    leaveId
) => {
    const leave =
        await Leave.findById(
            leaveId
        );

    if (!leave) {
        throw new Error(
            "Leave request not found"
        );
    }

    return leave;
};

/*
|--------------------------------------------------------------------------
| Get My Leave By ID
|--------------------------------------------------------------------------
|
| Ensures employee can only access
| their own leave.
|
*/

const getMyLeaveById = async ({
    userId,
    leaveId
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const leave =
        await Leave.findOne({
            _id: leaveId,

            employeeId:
                employee.employeeId
        });

    if (!leave) {
        throw new Error(
            "Leave request not found"
        );
    }

    return leave;
};

/*
|--------------------------------------------------------------------------
| Cancel Leave
|--------------------------------------------------------------------------
|
| Employee can cancel only a pending
| leave request.
|
*/

const cancelLeave = async ({
    userId,
    leaveId
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const leave =
        await Leave.findOne({
            _id: leaveId,

            employeeId:
                employee.employeeId
        });

    if (!leave) {
        throw new Error(
            "Leave request not found"
        );
    }

    if (
        leave.status !==
        LEAVE_STATUS.PENDING
    ) {
        throw new Error(
            "Only pending leave requests can be cancelled"
        );
    }

    /*
     * Keep the existing 3-status contract.
     *
     * If your Leave.js later adds "cancelled",
     * this can be changed to:
     *
     * leave.status = "cancelled";
     */
    await Leave.findByIdAndDelete(
        leave._id
    );

    return {
        message:
            "Leave request cancelled successfully"
    };
};

/*
|--------------------------------------------------------------------------
| Get All Leaves
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const getAllLeaves = async ({
    page = 1,
    limit = 10,
    status,
    leaveType,
    employeeId,
    startDate,
    endDate
} = {}) => {
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (leaveType) {
        filter.leaveType =
            leaveType;
    }

    if (employeeId) {
        filter.employeeId =
            normalizeEmployeeId(
                employeeId
            );
    }

    /*
     * Filter requests that overlap
     * with the requested date range.
     */
    if (startDate && endDate) {
        filter.startDate = {
            $lte: new Date(endDate)
        };

        filter.endDate = {
            $gte: new Date(startDate)
        };
    }

    const pageNumber =
        Number(page);

    const limitNumber =
        Number(limit);

    const skip =
        (pageNumber - 1) *
        limitNumber;

    const [
        leaves,
        total
    ] = await Promise.all([
        Leave.find(filter)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limitNumber),

        Leave.countDocuments(
            filter
        )
    ]);

    return {
        leaves,

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
| Approve Leave
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const approveLeave = async ({
    leaveId,
    adminComment,
    adminUserId
}) => {
    const leave =
        await Leave.findById(
            leaveId
        );

    if (!leave) {
        throw new Error(
            "Leave request not found"
        );
    }

    if (
        leave.status !==
        LEAVE_STATUS.PENDING
    ) {
        throw new Error(
            `Leave request is already ${leave.status}`
        );
    }

    /*
     * Get employee.
     */
    const employee =
        await getEmployee(
            leave.employeeId
        );

    /*
     * Check again for overlapping approved
     * leave before approval.
     *
     * This prevents conflicts if another
     * request was approved while this request
     * was pending.
     */
    const overlapping =
        await Leave.findOne({
            _id: {
                $ne: leave._id
            },

            employeeId:
                leave.employeeId,

            status:
                LEAVE_STATUS.APPROVED,

            startDate: {
                $lte: leave.endDate
            },

            endDate: {
                $gte: leave.startDate
            }
        });

    if (overlapping) {
        throw new Error(
            "Cannot approve this leave because it overlaps with another approved leave"
        );
    }

    /*
     * Update leave.
     */
    leave.status =
        LEAVE_STATUS.APPROVED;

    leave.adminComment =
        adminComment || null;

    leave.approvedBy =
        adminUserId;

    leave.approvedAt =
        new Date();

    await leave.save();

    /*
     * Create in-app notification.
     */
    await Notification.create({
        employeeId:
            employee.employeeId,

        type: "leave",

        title:
            "Leave Request Approved",

        message:
            `Your ${leave.leaveType} leave from ${formatDate(
                leave.startDate
            )} to ${formatDate(
                leave.endDate
            )} has been approved.`,

        read: false
    });

    /*
     * Send email.
     *
     * Email failure should not undo the
     * already-approved leave.
     */
    try {
        await sendLeaveApprovedEmail({
            email:
                employee.user.email,

            name:
                `${employee.firstName || ""} ${
                    employee.lastName || ""
                }`.trim(),

            leaveType:
                leave.leaveType,

            startDate:
                formatDate(
                    leave.startDate
                ),

            endDate:
                formatDate(
                    leave.endDate
                ),

            totalDays:
                leave.totalDays,

            adminComment:
                leave.adminComment
        });
    } catch (error) {
        console.error(
            "Leave approval email failed:",
            error.message
        );
    }

    return leave;
};

/*
|--------------------------------------------------------------------------
| Reject Leave
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const rejectLeave = async ({
    leaveId,
    adminComment,
    adminUserId
}) => {
    const leave =
        await Leave.findById(
            leaveId
        );

    if (!leave) {
        throw new Error(
            "Leave request not found"
        );
    }

    if (
        leave.status !==
        LEAVE_STATUS.PENDING
    ) {
        throw new Error(
            `Leave request is already ${leave.status}`
        );
    }

    /*
     * Rejection should have a reason.
     */
    if (
        !adminComment ||
        !adminComment.trim()
    ) {
        throw new Error(
            "Admin comment is required when rejecting leave"
        );
    }

    const employee =
        await getEmployee(
            leave.employeeId
        );

    leave.status =
        LEAVE_STATUS.REJECTED;

    leave.adminComment =
        adminComment.trim();

    leave.rejectedBy =
        adminUserId;

    leave.rejectedAt =
        new Date();

    await leave.save();

    /*
     * In-app notification.
     */
    await Notification.create({
        employeeId:
            employee.employeeId,

        type: "leave",

        title:
            "Leave Request Rejected",

        message:
            `Your ${leave.leaveType} leave request from ${formatDate(
                leave.startDate
            )} to ${formatDate(
                leave.endDate
            )} has been rejected.`,

        read: false
    });

    /*
     * Email notification.
     */
    try {
        await sendLeaveRejectedEmail({
            email:
                employee.user.email,

            name:
                `${employee.firstName || ""} ${
                    employee.lastName || ""
                }`.trim(),

            leaveType:
                leave.leaveType,

            startDate:
                formatDate(
                    leave.startDate
                ),

            endDate:
                formatDate(
                    leave.endDate
                ),

            totalDays:
                leave.totalDays,

            adminComment:
                leave.adminComment
        });
    } catch (error) {
        console.error(
            "Leave rejection email failed:",
            error.message
        );
    }

    return leave;
};

/*
|--------------------------------------------------------------------------
| Get Pending Leave Count
|--------------------------------------------------------------------------
|
| Useful for Admin dashboard.
|
*/

const getPendingLeaveCount =
    async () => {
        return Leave.countDocuments({
            status:
                LEAVE_STATUS.PENDING
        });
    };

/*
|--------------------------------------------------------------------------
| Get Leave Statistics
|--------------------------------------------------------------------------
|
| Useful for Employee dashboard.
|
*/

const getMyLeaveStatistics =
    async (userId) => {
        const employee =
            await Employee.findOne({
                user: userId
            });

        if (!employee) {
            throw new Error(
                "Employee profile not found"
            );
        }

        const employeeId =
            employee.employeeId;

        const [
            pending,
            approved,
            rejected
        ] = await Promise.all([
            Leave.countDocuments({
                employeeId,
                status:
                    LEAVE_STATUS.PENDING
            }),

            Leave.countDocuments({
                employeeId,
                status:
                    LEAVE_STATUS.APPROVED
            }),

            Leave.countDocuments({
                employeeId,
                status:
                    LEAVE_STATUS.REJECTED
            })
        ]);

        return {
            pending,
            approved,
            rejected
        };
    };

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

const formatDate = (
    date
) => {
    if (!date) {
        return "";
    }

    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    applyLeave,
    getMyLeaves,
    getMyLeaveById,
    getLeaveById,
    cancelLeave,

    getAllLeaves,
    approveLeave,
    rejectLeave,

    getPendingLeaveCount,
    getMyLeaveStatistics
};