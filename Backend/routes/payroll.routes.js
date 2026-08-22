import express from "express";

import {
    createPayrollController,
    getMyPayrollController,
    getMyPayrollByIdController,
    getAllPayrollController,
    getPayrollByIdController,
    updatePayrollController,
    deletePayrollController
} from "../controllers/payroll.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
    createPayrollValidator,
    updatePayrollValidator,
    payrollQueryValidator
} from "../validators/payroll.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| EMPLOYEE PAYROLL ROUTES
|--------------------------------------------------------------------------
*/

/*
| GET /api/payroll/me
| Employee views their own payroll records
*/

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    validate(payrollQueryValidator),
    getMyPayrollController
);

/*
| GET /api/payroll/me/:payrollId
| Employee views a specific payroll record
*/

router.get(
    "/me/:payrollId",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyPayrollByIdController
);

/*
|--------------------------------------------------------------------------
| ADMIN PAYROLL ROUTES
|--------------------------------------------------------------------------
*/

/*
| POST /api/payroll
| Admin creates payroll
*/

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(createPayrollValidator),
    createPayrollController
);

/*
| GET /api/payroll
| Admin views all payroll records
*/

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(payrollQueryValidator),
    getAllPayrollController
);

/*
| GET /api/payroll/:payrollId
| Admin views a specific payroll record
*/

router.get(
    "/:payrollId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getPayrollByIdController
);

/*
| PATCH /api/payroll/:payrollId
| Admin updates payroll
*/

router.patch(
    "/:payrollId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(updatePayrollValidator),
    updatePayrollController
);

/*
| DELETE /api/payroll/:payrollId
| Admin deletes payroll
*/

router.delete(
    "/:payrollId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deletePayrollController
);

export default router;