import express from "express";

import {
    applyLeaveController,
    getMyLeavesController,
    getMyLeaveByIdController,
    cancelLeaveController,
    getAllLeavesController,
    getLeaveByIdController,
    approveLeaveController,
    rejectLeaveController
} from "../controllers/leave.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
    applyLeaveValidator,
    leaveQueryValidator,
    leaveActionValidator
} from "../validators/leave.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| EMPLOYEE LEAVE ROUTES
|--------------------------------------------------------------------------
*/

/*
| POST /api/leaves
| Employee applies for leave
*/

router.post(
    "/",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    validate(applyLeaveValidator),
    applyLeaveController
);

/*
| GET /api/leaves/me
| Employee views own leave requests
*/

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    validate(leaveQueryValidator),
    getMyLeavesController
);

/*
| GET /api/leaves/me/:leaveId
| Employee views one of their leave requests
*/

router.get(
    "/me/:leaveId",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyLeaveByIdController
);

/*
| PATCH /api/leaves/:leaveId/cancel
| Employee cancels a pending leave request
*/

router.patch(
    "/:leaveId/cancel",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    cancelLeaveController
);

/*
|--------------------------------------------------------------------------
| ADMIN LEAVE ROUTES
|--------------------------------------------------------------------------
*/

/*
| GET /api/leaves
| Admin views all leave requests
*/

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(leaveQueryValidator),
    getAllLeavesController
);

/*
| GET /api/leaves/:leaveId
| Admin views a specific leave request
*/

router.get(
    "/:leaveId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getLeaveByIdController
);

/*
| PATCH /api/leaves/:leaveId/approve
| Admin approves leave
*/

router.patch(
    "/:leaveId/approve",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(leaveActionValidator),
    approveLeaveController
);

/*
| PATCH /api/leaves/:leaveId/reject
| Admin rejects leave
*/

router.patch(
    "/:leaveId/reject",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(leaveActionValidator),
    rejectLeaveController
);

export default router;