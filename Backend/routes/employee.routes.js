import express from "express";

import {
    createEmployeeController,
    getAllEmployeesController,
    getEmployeeByIdController,
    getMyProfileController,
    updateEmployeeController,
    updateMyProfileController,
    deleteEmployeeController
} from "../controllers/employee.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import uploadMiddleware from "../middleware/upload.middleware.js";

import {
    createEmployeeValidator,
    updateEmployeeValidator,
    updateMyProfileValidator
} from "../validators/employee.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Employee - Own Profile
|--------------------------------------------------------------------------
*/

/*
| GET /api/employees/me
| Employee can view their own profile
*/

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyProfileController
);

/*
| PATCH /api/employees/me
| Employee can update limited profile fields
*/

router.patch(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    uploadMiddleware.single("profilePicture"),
    validate(updateMyProfileValidator),
    updateMyProfileController
);

/*
|--------------------------------------------------------------------------
| Admin - Employee Management
|--------------------------------------------------------------------------
*/

/*
| POST /api/employees
| Admin creates an employee
*/

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(createEmployeeValidator),
    createEmployeeController
);

/*
| GET /api/employees
| Admin views all employees
*/

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAllEmployeesController
);

/*
| GET /api/employees/:employeeId
| Admin views a specific employee
*/

router.get(
    "/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getEmployeeByIdController
);

/*
| PATCH /api/employees/:employeeId
| Admin can update employee details
*/

router.patch(
    "/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    uploadMiddleware.single("profilePicture"),
    validate(updateEmployeeValidator),
    updateEmployeeController
);

/*
| DELETE /api/employees/:employeeId
| Admin deactivates employee
*/

router.delete(
    "/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteEmployeeController
);

export default router;
