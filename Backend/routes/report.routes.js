import express from "express";

import {
    getAdminDashboardReportController,

    getEmployeeSummaryController,
    getEmployeeReportController,

    getAttendanceReportController,
    getAttendanceSummaryController,
    getMonthlyAttendanceTrendController,

    getLeaveReportController,
    getLeaveSummaryController,

    getPayrollReportController,
    getPayrollSummaryController,
    getMonthlyPayrollTrendController,

    getDepartmentReportController
} from "../controllers/report.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD REPORT
|--------------------------------------------------------------------------
*/

/*
| GET /api/reports/admin-dashboard
| Complete admin dashboard analytics
*/

router.get(
    "/admin-dashboard",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAdminDashboardReportController
);

/*
|--------------------------------------------------------------------------
| EMPLOYEE REPORTS
|--------------------------------------------------------------------------
*/

/*
| GET /api/reports/employees
| Employee statistics
*/

router.get(
    "/employees",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getEmployeeSummaryController
);

/*
| GET /api/reports/employees/:employeeId
| Complete report for one employee
*/

router.get(
    "/employees/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getEmployeeReportController
);

/*
|--------------------------------------------------------------------------
| ATTENDANCE REPORTS
|--------------------------------------------------------------------------
*/

/*
| GET /api/reports/attendance
| Attendance records with filters
*/

router.get(
    "/attendance",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAttendanceReportController
);

/*
| GET /api/reports/attendance/summary
| Attendance statistics
*/

router.get(
    "/attendance/summary",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getAttendanceSummaryController
);

/*
| GET /api/reports/attendance/trend
| Monthly attendance trend
*/

router.get(
    "/attendance/trend",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getMonthlyAttendanceTrendController
);

/*
|--------------------------------------------------------------------------
| LEAVE REPORTS
|--------------------------------------------------------------------------
*/

/*
| GET /api/reports/leaves
| Leave records with filters
*/

router.get(
    "/leaves",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getLeaveReportController
);

/*
| GET /api/reports/leaves/summary
| Leave statistics
*/

router.get(
    "/leaves/summary",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getLeaveSummaryController
);

/*
|--------------------------------------------------------------------------
| PAYROLL REPORTS
|--------------------------------------------------------------------------
*/

/*
| GET /api/reports/payroll
| Payroll records
*/

router.get(
    "/payroll",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getPayrollReportController
);

/*
| GET /api/reports/payroll/summary
| Payroll statistics
*/

router.get(
    "/payroll/summary",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getPayrollSummaryController
);

/*
| GET /api/reports/payroll/trend
| Monthly payroll trend
*/

router.get(
    "/payroll/trend",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getMonthlyPayrollTrendController
);

/*
|--------------------------------------------------------------------------
| DEPARTMENT REPORT
|--------------------------------------------------------------------------
*/

/*
| GET /api/reports/departments
| Employee distribution by department
*/

router.get(
    "/departments",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getDepartmentReportController
);

export default router;
