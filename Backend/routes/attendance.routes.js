import express from "express";

import {
    checkInController,
    checkOutController,
    getMyAttendanceController,
    getMyAttendanceSummaryController,
    getEmployeeAttendanceController,
    getAllAttendanceController,
    getAttendanceByIdController,
    updateAttendanceController
} from "../controllers/attendance.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Employee Attendance Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/check-in",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    checkInController
);

router.post(
    "/check-out",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    checkOutController
);

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyAttendanceController
);

router.get(
    "/me/summary",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyAttendanceSummaryController
);

/*
|--------------------------------------------------------------------------
| Admin Attendance Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getEmployeeAttendanceController
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllAttendanceController
);

router.get(
    "/:attendanceId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAttendanceByIdController
);

router.patch(
    "/:attendanceId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateAttendanceController
);

export default router;
