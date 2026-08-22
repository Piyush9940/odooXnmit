import {
    createPayroll,
    getMyPayroll,
    getMyPayrollById,
    getAllPayroll,
    getPayrollById,
    updatePayroll,
    deletePayroll
} from "../services/payroll.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Create Payroll
|--------------------------------------------------------------------------
| POST /api/payroll
| ADMIN only
|--------------------------------------------------------------------------
*/

const createPayrollController = async (
    req,
    res,
    next
) => {
    try {
        const payroll =
            await createPayroll(
                req.body
            );

        return successResponse(
            res,
            201,
            "Payroll created successfully",
            payroll
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get My Payroll
|--------------------------------------------------------------------------
| GET /api/payroll/me
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyPayrollController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                month,
                year,
                page,
                limit
            } = req.query;

            const result =
                await getMyPayroll({
                    userId:
                        req.user.id,

                    month,

                    year,

                    page,

                    limit
                });

            return successResponse(
                res,
                200,
                "Payroll records fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Payroll By ID
|--------------------------------------------------------------------------
| GET /api/payroll/me/:payrollId
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyPayrollByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                payrollId
            } = req.params;

            const payroll =
                await getMyPayrollById({
                    userId:
                        req.user.id,

                    payrollId
                });

            return successResponse(
                res,
                200,
                "Payroll record fetched successfully",
                payroll
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get All Payroll
|--------------------------------------------------------------------------
| GET /api/payroll
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAllPayrollController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                month,
                year,
                employeeId,
                status,
                page,
                limit
            } = req.query;

            const result =
                await getAllPayroll({
                    month,

                    year,

                    employeeId,

                    status,

                    page,

                    limit
                });

            return successResponse(
                res,
                200,
                "Payroll records fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Payroll By ID
|--------------------------------------------------------------------------
| GET /api/payroll/:payrollId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getPayrollByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                payrollId
            } = req.params;

            const payroll =
                await getPayrollById(
                    payrollId
                );

            return successResponse(
                res,
                200,
                "Payroll record fetched successfully",
                payroll
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Update Payroll
|--------------------------------------------------------------------------
| PATCH /api/payroll/:payrollId
| ADMIN only
|--------------------------------------------------------------------------
*/

const updatePayrollController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                payrollId
            } = req.params;

            const payroll =
                await updatePayroll(
                    payrollId,
                    req.body
                );

            return successResponse(
                res,
                200,
                "Payroll updated successfully",
                payroll
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Delete Payroll
|--------------------------------------------------------------------------
| DELETE /api/payroll/:payrollId
| ADMIN only
|--------------------------------------------------------------------------
*/

const deletePayrollController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                payrollId
            } = req.params;

            const result =
                await deletePayroll(
                    payrollId
                );

            return successResponse(
                res,
                200,
                "Payroll deleted successfully",
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
    createPayrollController,

    getMyPayrollController,
    getMyPayrollByIdController,

    getAllPayrollController,
    getPayrollByIdController,

    updatePayrollController,
    deletePayrollController
};