import {
    applyLeave,
    getMyLeaves,
    getMyLeaveById,
    cancelLeave,
    getAllLeaves,
    getLeaveById,
    approveLeave,
    rejectLeave
} from "../services/leave.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Apply For Leave
|--------------------------------------------------------------------------
| POST /api/leaves
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const applyLeaveController = async (
    req,
    res,
    next
) => {
    try {
        const leave =
            await applyLeave({
                userId:
                    req.user.id,

                ...req.body
            });

        return successResponse(
            res,
            201,
            "Leave request submitted successfully",
            leave
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get My Leaves
|--------------------------------------------------------------------------
| GET /api/leaves/me
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyLeavesController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                page,
                limit,
                status,
                leaveType,
                startDate,
                endDate
            } = req.query;

            const result =
                await getMyLeaves({
                    userId:
                        req.user.id,

                    page,

                    limit,

                    status,

                    leaveType,

                    startDate,

                    endDate
                });

            return successResponse(
                res,
                200,
                "Leave requests fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Leave By ID
|--------------------------------------------------------------------------
| GET /api/leaves/me/:leaveId
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyLeaveByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                leaveId
            } = req.params;

            const leave =
                await getMyLeaveById({
                    userId:
                        req.user.id,

                    leaveId
                });

            return successResponse(
                res,
                200,
                "Leave request fetched successfully",
                leave
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Cancel Leave
|--------------------------------------------------------------------------
| PATCH /api/leaves/:leaveId/cancel
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const cancelLeaveController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                leaveId
            } = req.params;

            const leave =
                await cancelLeave({
                    userId:
                        req.user.id,

                    leaveId
                });

            return successResponse(
                res,
                200,
                "Leave request cancelled successfully",
                leave
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get All Leave Requests
|--------------------------------------------------------------------------
| GET /api/leaves
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAllLeavesController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                page,
                limit,
                status,
                leaveType,
                employeeId,
                startDate,
                endDate
            } = req.query;

            const result =
                await getAllLeaves({
                    page,

                    limit,

                    status,

                    leaveType,

                    employeeId,

                    startDate,

                    endDate
                });

            return successResponse(
                res,
                200,
                "Leave requests fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Leave By ID
|--------------------------------------------------------------------------
| GET /api/leaves/:leaveId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getLeaveByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                leaveId
            } = req.params;

            const leave =
                await getLeaveById(
                    leaveId
                );

            return successResponse(
                res,
                200,
                "Leave request fetched successfully",
                leave
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Approve Leave
|--------------------------------------------------------------------------
| PATCH /api/leaves/:leaveId/approve
| ADMIN only
|--------------------------------------------------------------------------
*/

const approveLeaveController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                leaveId
            } = req.params;

            const {
                comment
            } = req.body;

            const leave =
                await approveLeave({
                    leaveId,

                    adminId:
                        req.user.id,

                    comment
                });

            return successResponse(
                res,
                200,
                "Leave request approved successfully",
                leave
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Reject Leave
|--------------------------------------------------------------------------
| PATCH /api/leaves/:leaveId/reject
| ADMIN only
|--------------------------------------------------------------------------
*/

const rejectLeaveController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                leaveId
            } = req.params;

            const {
                comment
            } = req.body;

            const leave =
                await rejectLeave({
                    leaveId,

                    adminId:
                        req.user.id,

                    comment
                });

            return successResponse(
                res,
                200,
                "Leave request rejected successfully",
                leave
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    applyLeaveController,

    getMyLeavesController,
    getMyLeaveByIdController,

    cancelLeaveController,

    getAllLeavesController,
    getLeaveByIdController,

    approveLeaveController,
    rejectLeaveController
};