import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeEmployeeId = (
    employeeId
) => {
    return employeeId
        ?.trim()
        .toUpperCase();
};

const getDateRange = ({
    startDate,
    endDate
}) => {
    const start = new Date(
        startDate
    );

    const end = new Date(
        endDate
    );

    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {
        throw new Error(
            "Invalid date range"
        );
    }

    if (start > end) {
        throw new Error(
            "Start date cannot be after end date"
        );
    }

    /*
     * Include the complete end date.
     */
    end.setHours(
        23,
        59,
        59,
        999
    );

    return {
        start,
        end
    };
};

/*
|--------------------------------------------------------------------------
| Employee Summary
|--------------------------------------------------------------------------
|
| Admin dashboard.
|
*/

const getEmployeeSummary =
    async () => {
        const [
            totalEmployees,
            activeEmployees,
            inactiveEmployees
        ] = await Promise.all([
            Employee.countDocuments(),

            Employee.countDocuments({
                status: "active"
            }),

            Employee.countDocuments({
                status: "inactive"
            })
        ]);

        return {
            totalEmployees,
            activeEmployees,
            inactiveEmployees
        };
    };

/*
|--------------------------------------------------------------------------
| Attendance Report
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const getAttendanceReport = async ({
    startDate,
    endDate,
    employeeId,
    status
}) => {
    const {
        start,
        end
    } = getDateRange({
        startDate,
        endDate
    });

    const filter = {
        date: {
            $gte: start,
            $lte: end
        }
    };

    if (employeeId) {
        filter.employeeId =
            normalizeEmployeeId(
                employeeId
            );
    }

    if (status) {
        filter.status =
            status;
    }

    const attendance =
        await Attendance.find(
            filter
        )
            .sort({
                date: -1
            });

    return {
        dateRange: {
            startDate: start,
            endDate: end
        },

        totalRecords:
            attendance.length,

        attendance
    };
};

/*
|--------------------------------------------------------------------------
| Attendance Summary
|--------------------------------------------------------------------------
|
| Used for charts/cards.
|
*/

const getAttendanceSummary = async ({
    startDate,
    endDate
}) => {
    const {
        start,
        end
    } = getDateRange({
        startDate,
        endDate
    });

    const result =
        await Attendance.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },

            {
                $group: {
                    _id: "$status",

                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

    const summary = {
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0
    };

    result.forEach(
        (item) => {
            if (
                item._id ===
                "present"
            ) {
                summary.present =
                    item.count;
            }

            if (
                item._id ===
                "absent"
            ) {
                summary.absent =
                    item.count;
            }

            if (
                item._id ===
                "half-day"
            ) {
                summary.halfDay =
                    item.count;
            }

            if (
                item._id ===
                "leave"
            ) {
                summary.leave =
                    item.count;
            }
        }
    );

    return {
        dateRange: {
            startDate: start,
            endDate: end
        },

        ...summary
    };
};

/*
|--------------------------------------------------------------------------
| Leave Report
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const getLeaveReport = async ({
    startDate,
    endDate,
    employeeId,
    status,
    leaveType
}) => {
    const {
        start,
        end
    } = getDateRange({
        startDate,
        endDate
    });

    const filter = {
        startDate: {
            $lte: end
        },

        endDate: {
            $gte: start
        }
    };

    if (employeeId) {
        filter.employeeId =
            normalizeEmployeeId(
                employeeId
            );
    }

    if (status) {
        filter.status =
            status;
    }

    if (leaveType) {
        filter.leaveType =
            leaveType;
    }

    const leaves =
        await Leave.find(
            filter
        )
            .sort({
                startDate: -1
            });

    return {
        dateRange: {
            startDate: start,
            endDate: end
        },

        totalRequests:
            leaves.length,

        leaves
    };
};

/*
|--------------------------------------------------------------------------
| Leave Summary
|--------------------------------------------------------------------------
|
| Used for dashboard charts.
|
*/

const getLeaveSummary = async ({
    startDate,
    endDate
}) => {
    const {
        start,
        end
    } = getDateRange({
        startDate,
        endDate
    });

    const result =
        await Leave.aggregate([
            {
                $match: {
                    startDate: {
                        $lte: end
                    },

                    endDate: {
                        $gte: start
                    }
                }
            },

            {
                $group: {
                    _id: {
                        status:
                            "$status",

                        leaveType:
                            "$leaveType"
                    },

                    count: {
                        $sum: 1
                    },

                    totalDays: {
                        $sum:
                            "$totalDays"
                    }
                }
            }
        ]);

    return {
        dateRange: {
            startDate: start,
            endDate: end
        },

        summary: result
    };
};

/*
|--------------------------------------------------------------------------
| Payroll Report
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const getPayrollReport = async ({
    month,
    year,
    employeeId,
    status
}) => {
    const filter = {};

    if (month) {
        filter.month =
            Number(month);
    }

    if (year) {
        filter.year =
            Number(year);
    }

    if (employeeId) {
        filter.employeeId =
            normalizeEmployeeId(
                employeeId
            );
    }

    if (status) {
        filter.status =
            status;
    }

    const payroll =
        await Payroll.find(
            filter
        )
            .sort({
                year: -1,
                month: -1
            });

    return {
        totalRecords:
            payroll.length,

        payroll
    };
};

/*
|--------------------------------------------------------------------------
| Payroll Summary
|--------------------------------------------------------------------------
|
| Used for admin dashboard.
|
*/

const getPayrollSummary = async ({
    month,
    year
}) => {
    const filter = {};

    if (month) {
        filter.month =
            Number(month);
    }

    if (year) {
        filter.year =
            Number(year);
    }

    const result =
        await Payroll.aggregate([
            {
                $match: filter
            },

            {
                $group: {
                    _id: null,

                    employeeCount: {
                        $sum: 1
                    },

                    totalBasicSalary: {
                        $sum:
                            "$basicSalary"
                    },

                    totalAllowances: {
                        $sum:
                            "$allowances"
                    },

                    totalBonuses: {
                        $sum:
                            "$bonuses"
                    },

                    totalDeductions: {
                        $sum:
                            "$deductions"
                    },

                    totalGrossSalary: {
                        $sum:
                            "$grossSalary"
                    },

                    totalNetSalary: {
                        $sum:
                            "$netSalary"
                    }
                }
            }
        ]);

    return (
        result[0] || {
            employeeCount: 0,
            totalBasicSalary: 0,
            totalAllowances: 0,
            totalBonuses: 0,
            totalDeductions: 0,
            totalGrossSalary: 0,
            totalNetSalary: 0
        }
    );
};

/*
|--------------------------------------------------------------------------
| Department Employee Report
|--------------------------------------------------------------------------
|
| Useful for Admin dashboard.
|
*/

const getDepartmentReport =
    async () => {
        const result =
            await Employee.aggregate([
                {
                    $group: {
                        _id:
                            "$department",

                        employeeCount: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        employeeCount:
                            -1
                    }
                }
            ]);

        return result;
    };

/*
|--------------------------------------------------------------------------
| Monthly Attendance Trend
|--------------------------------------------------------------------------
|
| Data suitable for Chart.js.
|
*/

const getMonthlyAttendanceTrend =
    async ({
        year
    }) => {
        const numericYear =
            Number(year);

        if (
            numericYear < 2000 ||
            numericYear > 2100
        ) {
            throw new Error(
                "Invalid year"
            );
        }

        const start =
            new Date(
                `${numericYear}-01-01T00:00:00.000Z`
            );

        const end =
            new Date(
                `${numericYear}-12-31T23:59:59.999Z`
            );

        const result =
            await Attendance.aggregate([
                {
                    $match: {
                        date: {
                            $gte: start,
                            $lte: end
                        }
                    }
                },

                {
                    $group: {
                        _id: {
                            month: {
                                $month:
                                    "$date"
                            },

                            status:
                                "$status"
                        },

                        count: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        "_id.month":
                            1
                    }
                }
            ]);

        /*
         * Format for frontend charts.
         */
        const months =
            Array.from(
                {
                    length: 12
                },
                (_, index) => ({
                    month:
                        index + 1,

                    present: 0,

                    absent: 0,

                    halfDay: 0,

                    leave: 0
                })
            );

        result.forEach(
            (item) => {
                const month =
                    months[
                        item._id
                            .month - 1
                    ];

                if (
                    item._id.status ===
                    "present"
                ) {
                    month.present =
                        item.count;
                }

                if (
                    item._id.status ===
                    "absent"
                ) {
                    month.absent =
                        item.count;
                }

                if (
                    item._id.status ===
                    "half-day"
                ) {
                    month.halfDay =
                        item.count;
                }

                if (
                    item._id.status ===
                    "leave"
                ) {
                    month.leave =
                        item.count;
                }
            }
        );

        return months;
    };

/*
|--------------------------------------------------------------------------
| Monthly Payroll Trend
|--------------------------------------------------------------------------
|
| Data suitable for Chart.js.
|
*/

const getMonthlyPayrollTrend =
    async ({
        year
    }) => {
        const numericYear =
            Number(year);

        if (
            numericYear < 2000 ||
            numericYear > 2100
        ) {
            throw new Error(
                "Invalid year"
            );
        }

        const result =
            await Payroll.aggregate([
                {
                    $match: {
                        year:
                            numericYear
                    }
                },

                {
                    $group: {
                        _id:
                            "$month",

                        grossSalary: {
                            $sum:
                                "$grossSalary"
                        },

                        deductions: {
                            $sum:
                                "$deductions"
                        },

                        netSalary: {
                            $sum:
                                "$netSalary"
                        }
                    }
                },

                {
                    $sort: {
                        _id: 1
                    }
                }
            ]);

        const months =
            Array.from(
                {
                    length: 12
                },
                (_, index) => ({
                    month:
                        index + 1,

                    grossSalary: 0,

                    deductions: 0,

                    netSalary: 0
                })
            );

        result.forEach(
            (item) => {
                months[
                    item._id - 1
                ] = {
                    month:
                        item._id,

                    grossSalary:
                        item.grossSalary,

                    deductions:
                        item.deductions,

                    netSalary:
                        item.netSalary
                };
            }
        );

        return months;
    };

/*
|--------------------------------------------------------------------------
| Employee Individual Report
|--------------------------------------------------------------------------
|
| Admin can view complete HR summary
| of one employee.
|
|--------------------------------------------------------------------------
*/

const getEmployeeReport = async (
    employeeId
) => {
    const normalizedEmployeeId =
        normalizeEmployeeId(
            employeeId
        );

    const employee =
        await Employee.findOne({
            employeeId:
                normalizedEmployeeId
        }).populate({
            path: "user",
            select:
                "email role isActive emailVerified"
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    const [
        attendanceCount,
        presentCount,
        leaveCount,
        payrollCount
    ] = await Promise.all([
        Attendance.countDocuments({
            employeeId:
                normalizedEmployeeId
        }),

        Attendance.countDocuments({
            employeeId:
                normalizedEmployeeId,

            status: "present"
        }),

        Leave.countDocuments({
            employeeId:
                normalizedEmployeeId
        }),

        Payroll.countDocuments({
            employeeId:
                normalizedEmployeeId
        })
    ]);

    return {
        employee,

        statistics: {
            attendanceCount,

            presentCount,

            leaveCount,

            payrollCount
        }
    };
};

/*
|--------------------------------------------------------------------------
| Admin Dashboard Report
|--------------------------------------------------------------------------
|
| Single API can provide the main HR
| dashboard data.
|
|--------------------------------------------------------------------------
*/

const getAdminDashboardReport =
    async ({
        month,
        year,
        startDate,
        endDate
    } = {}) => {
        const employeeSummary =
            await getEmployeeSummary();

        let attendanceSummary = null;
        let leaveSummary = null;

        /*
         * If no custom date range is provided,
         * use the current month.
         */
        if (!startDate || !endDate) {
            const numericYear =
                Number(
                    year ||
                        new Date()
                            .getFullYear()
                );

            const numericMonth =
                Number(
                    month ||
                        new Date()
                            .getMonth() + 1
                );

            startDate =
                new Date(
                    numericYear,
                    numericMonth - 1,
                    1
                );

            endDate =
                new Date(
                    numericYear,
                    numericMonth,
                    0
                );
        }

        attendanceSummary =
            await getAttendanceSummary({
                startDate,
                endDate
            });

        leaveSummary =
            await getLeaveSummary({
                startDate,
                endDate
            });

        const payrollSummary =
            await getPayrollSummary({
                month,
                year
            });

        const pendingLeaves =
            await Leave.countDocuments({
                status: "pending"
            });

        return {
            employees:
                employeeSummary,

            attendance:
                attendanceSummary,

            leaves: {
                ...leaveSummary,

                pending:
                    pendingLeaves
            },

            payroll:
                payrollSummary
        };
    };

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
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
};