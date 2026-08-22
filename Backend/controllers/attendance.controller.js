import {
    checkIn,
    checkOut,
    getMyAttendance,
    getMyAttendanceSummary,
    getEmployeeAttendance,
    getAllAttendance,
    updateAttendance,
    getAttendanceById
} from "../services/attendance.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Employee Check In
|--------------------------------------------------------------------------
| POST /api/attendance/check-in
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const checkInController = async (
    req,
    res,
    next
) => {
    try {
        const attendance =
            await checkIn(
                req.user.id
            );

        return successResponse(
            res,
            201,
            "Check-in successful",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Employee Check Out
|--------------------------------------------------------------------------
| POST /api/attendance/check-out
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const checkOutController = async (
    req,
    res,
    next
) => {
    try {
        const attendance =
            await checkOut(
                req.user.id
            );

        return successResponse(
            res,
            200,
            "Check-out successful",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get My Attendance
|--------------------------------------------------------------------------
| GET /api/attendance/me
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyAttendanceController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                startDate,
                endDate,
                page,
                limit,
                status
            } = req.query;

            const result =
                await getMyAttendance({
                    userId:
                        req.user.id,

                    startDate,

                    endDate,

                    page,

                    limit,

                    status
                });

            return successResponse(
                res,
                200,
                "Attendance fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Attendance Summary
|--------------------------------------------------------------------------
| GET /api/attendance/me/summary
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyAttendanceSummaryController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                startDate,
                endDate
            } = req.query;

            const result =
                await getMyAttendanceSummary({
                    userId:
                        req.user.id,

                    startDate,

                    endDate
                });

            return successResponse(
                res,
                200,
                "Attendance summary fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Employee Attendance
|--------------------------------------------------------------------------
| GET /api/attendance/employee/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getEmployeeAttendanceController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const {
                startDate,
                endDate,
                page,
                limit,
                status
            } = req.query;

            const result =
                await getEmployeeAttendance({
                    employeeId,

                    startDate,

                    endDate,

                    page,

                    limit,

                    status
                });

            return successResponse(
                res,
                200,
                "Employee attendance fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get All Attendance
|--------------------------------------------------------------------------
| GET /api/attendance
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAllAttendanceController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                startDate,
                endDate,
                page,
                limit,
                employeeId,
                status
            } = req.query;

            const result =
                await getAllAttendance({
                    startDate,

                    endDate,

                    page,

                    limit,

                    employeeId,

                    status
                });

            return successResponse(
                res,
                200,
                "Attendance records fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Attendance By ID
|--------------------------------------------------------------------------
| GET /api/attendance/:attendanceId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAttendanceByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                attendanceId
            } = req.params;

            const attendance =
                await getAttendanceById(
                    attendanceId
                );

            return successResponse(
                res,
                200,
                "Attendance record fetched successfully",
                attendance
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Update Attendance
|--------------------------------------------------------------------------
| PATCH /api/attendance/:attendanceId
| ADMIN only
|--------------------------------------------------------------------------
*/

const updateAttendanceController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                attendanceId
            } = req.params;

            const attendance =
                await updateAttendance(
                    attendanceId,
                    req.body
                );

            return successResponse(
                res,
                200,
                "Attendance updated successfully",
                attendance
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
    checkInController,
    checkOutController,

    getMyAttendanceController,
    getMyAttendanceSummaryController,

    getEmployeeAttendanceController,
    getAllAttendanceController,

    getAttendanceByIdController,
    updateAttendanceController
};