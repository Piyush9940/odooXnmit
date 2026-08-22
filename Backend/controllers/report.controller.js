import {
    getEmployeeSummary,
    getAttendanceReport,
    getAttendanceSummary,
    getLeaveReport,
    getLeaveSummary,
    getPayrollReport,
    getPayrollSummary,
    getDepartmentReport,
    getMonthlyAttendanceTrend,
    getMonthlyPayrollTrend,
    getEmployeeReport,
    getAdminDashboardReport
} from "../services/report.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Admin Dashboard Report
|--------------------------------------------------------------------------
| GET /api/reports/admin-dashboard
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAdminDashboardReportController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                month,
                year,
                startDate,
                endDate
            } = req.query;

            const report =
                await getAdminDashboardReport({
                    month,
                    year,
                    startDate,
                    endDate
                });

            return successResponse(
                res,
                200,
                "Admin dashboard report fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Employee Summary
|--------------------------------------------------------------------------
| GET /api/reports/employees
| ADMIN only
|--------------------------------------------------------------------------
*/

const getEmployeeSummaryController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const report =
                await getEmployeeSummary();

            return successResponse(
                res,
                200,
                "Employee summary fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Attendance Report
|--------------------------------------------------------------------------
| GET /api/reports/attendance
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAttendanceReportController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                startDate,
                endDate,
                employeeId,
                status
            } = req.query;

            const report =
                await getAttendanceReport({
                    startDate,
                    endDate,
                    employeeId,
                    status
                });

            return successResponse(
                res,
                200,
                "Attendance report fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Attendance Summary
|--------------------------------------------------------------------------
| GET /api/reports/attendance/summary
| ADMIN only
|--------------------------------------------------------------------------
*/

const getAttendanceSummaryController =
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

            const report =
                await getAttendanceSummary({
                    startDate,
                    endDate
                });

            return successResponse(
                res,
                200,
                "Attendance summary fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Attendance Trend
|--------------------------------------------------------------------------
| GET /api/reports/attendance/trend
| ADMIN only
|--------------------------------------------------------------------------
*/

const getMonthlyAttendanceTrendController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                year
            } = req.query;

            const report =
                await getMonthlyAttendanceTrend({
                    year
                });

            return successResponse(
                res,
                200,
                "Attendance trend fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Leave Report
|--------------------------------------------------------------------------
| GET /api/reports/leaves
| ADMIN only
|--------------------------------------------------------------------------
*/

const getLeaveReportController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                startDate,
                endDate,
                employeeId,
                status,
                leaveType
            } = req.query;

            const report =
                await getLeaveReport({
                    startDate,
                    endDate,
                    employeeId,
                    status,
                    leaveType
                });

            return successResponse(
                res,
                200,
                "Leave report fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Leave Summary
|--------------------------------------------------------------------------
| GET /api/reports/leaves/summary
| ADMIN only
|--------------------------------------------------------------------------
*/

const getLeaveSummaryController =
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

            const report =
                await getLeaveSummary({
                    startDate,
                    endDate
                });

            return successResponse(
                res,
                200,
                "Leave summary fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Payroll Report
|--------------------------------------------------------------------------
| GET /api/reports/payroll
| ADMIN only
|--------------------------------------------------------------------------
*/

const getPayrollReportController =
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
                status
            } = req.query;

            const report =
                await getPayrollReport({
                    month,
                    year,
                    employeeId,
                    status
                });

            return successResponse(
                res,
                200,
                "Payroll report fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Payroll Summary
|--------------------------------------------------------------------------
| GET /api/reports/payroll/summary
| ADMIN only
|--------------------------------------------------------------------------
*/

const getPayrollSummaryController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                month,
                year
            } = req.query;

            const report =
                await getPayrollSummary({
                    month,
                    year
                });

            return successResponse(
                res,
                200,
                "Payroll summary fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Payroll Trend
|--------------------------------------------------------------------------
| GET /api/reports/payroll/trend
| ADMIN only
|--------------------------------------------------------------------------
*/

const getMonthlyPayrollTrendController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                year
            } = req.query;

            const report =
                await getMonthlyPayrollTrend({
                    year
                });

            return successResponse(
                res,
                200,
                "Payroll trend fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Department Report
|--------------------------------------------------------------------------
| GET /api/reports/departments
| ADMIN only
|--------------------------------------------------------------------------
*/

const getDepartmentReportController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const report =
                await getDepartmentReport();

            return successResponse(
                res,
                200,
                "Department report fetched successfully",
                report
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Individual Employee Report
|--------------------------------------------------------------------------
| GET /api/reports/employees/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getEmployeeReportController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const report =
                await getEmployeeReport(
                    employeeId
                );

            return successResponse(
                res,
                200,
                "Employee report fetched successfully",
                report
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
    getAdminDashboardReportController,

    getEmployeeSummaryController,

    getAttendanceReportController,
    getAttendanceSummaryController,
    getMonthlyAttendanceTrendController,

    getLeaveReportController,
    getLeaveSummaryController,

    getPayrollReportController,
    getPayrollSummaryController,
    getMonthlyPayrollTrendController,

    getDepartmentReportController,

    getEmployeeReportController
};