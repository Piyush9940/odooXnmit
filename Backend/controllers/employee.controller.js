import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    getMyProfile,
    updateEmployee,
    updateMyProfile,
    deleteEmployee
} from "../services/employee.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Create Employee
|--------------------------------------------------------------------------
| POST /api/employees
| ADMIN only
|--------------------------------------------------------------------------
*/

const createEmployeeController = async (
    req,
    res,
    next
) => {
    try {
        const employee =
            await createEmployee(
                req.body
            );

        return successResponse(
            res,
            201,
            "Employee created successfully",
            employee
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get All Employees
|--------------------------------------------------------------------------
| GET /api/employees
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAllEmployeesController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                page,
                limit,
                search,
                department,
                status
            } = req.query;

            const result =
                await getAllEmployees({
                    page,
                    limit,
                    search,
                    department,
                    status
                });

            return successResponse(
                res,
                200,
                "Employees fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Employee By ID
|--------------------------------------------------------------------------
| GET /api/employees/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getEmployeeByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const employee =
                await getEmployeeById(
                    employeeId
                );

            return successResponse(
                res,
                200,
                "Employee fetched successfully",
                employee
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Profile
|--------------------------------------------------------------------------
| GET /api/employees/me
| EMPLOYEE
|--------------------------------------------------------------------------
*/

const getMyProfileController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const employee =
                await getMyProfile(
                    req.user.id
                );

            return successResponse(
                res,
                200,
                "Profile fetched successfully",
                employee
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Update Employee
|--------------------------------------------------------------------------
| PATCH /api/employees/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const updateEmployeeController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const employee =
                await updateEmployee(
                    employeeId,
                    req.body
                );

            return successResponse(
                res,
                200,
                "Employee updated successfully",
                employee
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Update My Profile
|--------------------------------------------------------------------------
| PATCH /api/employees/me
| EMPLOYEE
|
| Employee can only modify limited
| profile fields.
|--------------------------------------------------------------------------
*/

const updateMyProfileController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const employee =
                await updateMyProfile(
                    req.user.id,
                    req.body
                );

            return successResponse(
                res,
                200,
                "Profile updated successfully",
                employee
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Delete / Deactivate Employee
|--------------------------------------------------------------------------
| DELETE /api/employees/:employeeId
| ADMIN only
|
| This performs a soft delete/deactivation.
|--------------------------------------------------------------------------
*/

const deleteEmployeeController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const result =
                await deleteEmployee(
                    employeeId
                );

            return successResponse(
                res,
                200,
                "Employee deactivated successfully",
                result
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
    createEmployeeController,
    getAllEmployeesController,
    getEmployeeByIdController,
    getMyProfileController,
    updateEmployeeController,
    updateMyProfileController,
    deleteEmployeeController
};