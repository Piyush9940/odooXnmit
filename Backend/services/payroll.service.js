import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";

import {
    uploadSalarySlip
} from "./cloudinary.service.js";

import {
    sendSalarySlipEmail
} from "./email.service.js";

import PDFDocument from "pdfkit";

/*
|--------------------------------------------------------------------------
| Payroll Status
|--------------------------------------------------------------------------
*/

const PAYROLL_STATUS = {
    DRAFT: "draft",
    PROCESSED: "processed"
};

/*
|--------------------------------------------------------------------------
| Normalize Employee ID
|--------------------------------------------------------------------------
*/

const normalizeEmployeeId = (
    employeeId
) => {
    return employeeId
        ?.trim()
        .toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Get Employee
|--------------------------------------------------------------------------
*/

const getEmployee = async (
    employeeId
) => {
    const employee =
        await Employee.findOne({
            employeeId:
                normalizeEmployeeId(
                    employeeId
                )
        }).populate({
            path: "user",
            select:
                "email role isActive"
        });

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    return employee;
};

/*
|--------------------------------------------------------------------------
| Calculate Salary
|--------------------------------------------------------------------------
|
| Example:
|
| Basic = 30000
| HRA = 12000
| Allowances = 5000
| Gross = 47000
| Deductions = 3000
| Net = 44000
|
*/

const calculateSalary = ({
    basicSalary = 0,
    hra = 0,
    allowances = 0,
    deductions = 0,
    bonuses = 0
}) => {
    const basic =
        Number(basicSalary);

    const houseRent =
        Number(hra);

    const allowance =
        Number(allowances);

    const deduction =
        Number(deductions);

    const bonus =
        Number(bonuses);

    if (
        basic < 0 ||
        houseRent < 0 ||
        allowance < 0 ||
        deduction < 0 ||
        bonus < 0
    ) {
        throw new Error(
            "Salary values cannot be negative"
        );
    }

    const grossSalary =
        basic +
        houseRent +
        allowance +
        bonus;

    const netSalary =
        grossSalary -
        deduction;

    if (netSalary < 0) {
        throw new Error(
            "Net salary cannot be negative"
        );
    }

    return {
        basicSalary: basic,
        hra: houseRent,
        allowances: allowance,
        bonuses: bonus,
        deductions: deduction,
        grossSalary,
        netSalary
    };
};

/*
|--------------------------------------------------------------------------
| Create Payroll
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const createPayroll = async ({
    employeeId,
    month,
    payrollMonth,
    year,
    payrollYear,
    basicSalary,
    hra,
    allowances,
    bonuses,
    deductions,
    salaryStructure,
    adminComment
}) => {
    const normalizedEmployeeId =
        normalizeEmployeeId(
            employeeId
        );

    const employee =
        await getEmployee(
            normalizedEmployeeId
        );

    /*
     * Validate month/year.
     */
    const numericMonth =
        Number(payrollMonth || month);

    const numericYear =
        Number(payrollYear || year);

    if (
        numericMonth < 1 ||
        numericMonth > 12
    ) {
        throw new Error(
            "Month must be between 1 and 12"
        );
    }

    if (
        numericYear < 2000 ||
        numericYear > 2100
    ) {
        throw new Error(
            "Invalid payroll year"
        );
    }

    /*
     * Prevent duplicate payroll.
     */
    const existingPayroll =
        await Payroll.findOne({
            employeeId:
                normalizedEmployeeId,

            payrollMonth:
                numericMonth,

            payrollYear:
                numericYear
        });

    if (existingPayroll) {
        throw new Error(
            "Payroll already exists for this employee and month"
        );
    }

    const basic = basicSalary ?? salaryStructure?.basicSalary ?? 0;
    const allowance = allowances ?? salaryStructure?.allowances ?? 0;
    const deduction = deductions ?? salaryStructure?.deductions ?? 0;

    const salary =
        calculateSalary({
            basicSalary: basic,
            hra,
            allowances: allowance,
            bonuses,
            deductions: deduction
        });

    const payroll =
        await Payroll.create({
            employee: employee._id,
            employeeId:
                normalizedEmployeeId,

            payrollMonth:
                numericMonth,

            payrollYear:
                numericYear,

            salaryStructure: {
                basicSalary: salary.basicSalary,
                allowances: salary.allowances,
                deductions: salary.deductions,
                grossSalary: salary.grossSalary,
                netSalary: salary.netSalary
            },

            status:
                PAYROLL_STATUS.DRAFT,

            adminComment:
                adminComment || null
        });

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Update Payroll
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const updatePayroll = async (
    payrollId,
    updateData
) => {
    const payroll =
        await Payroll.findById(
            payrollId
        );

    if (!payroll) {
        throw new Error(
            "Payroll record not found"
        );
    }

    /*
     * Do not allow changing identity
     * or system fields.
     */
    const protectedFields = [
        "_id",
        "employeeId",
        "month",
        "year",
        "grossSalary",
        "netSalary",
        "salarySlip",
        "status",
        "createdAt",
        "updatedAt"
    ];

    for (
        const field of protectedFields
    ) {
        delete updateData[field];
    }

    const salary =
        calculateSalary({
            basicSalary:
                updateData.basicSalary ??
                payroll.basicSalary,

            hra:
                updateData.hra ??
                payroll.hra,

            allowances:
                updateData.allowances ??
                payroll.allowances,

            bonuses:
                updateData.bonuses ??
                payroll.bonuses,

            deductions:
                updateData.deductions ??
                payroll.deductions
        });

    payroll.basicSalary =
        salary.basicSalary;

    payroll.hra =
        salary.hra;

    payroll.allowances =
        salary.allowances;

    payroll.bonuses =
        salary.bonuses;

    payroll.deductions =
        salary.deductions;

    payroll.grossSalary =
        salary.grossSalary;

    payroll.netSalary =
        salary.netSalary;

    if (
        updateData.adminComment !==
        undefined
    ) {
        payroll.adminComment =
            updateData.adminComment;
    }

    await payroll.save();

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Get Payroll By ID
|--------------------------------------------------------------------------
*/

const getPayrollById = async (
    payrollId
) => {
    const payroll =
        await Payroll.findById(
            payrollId
        );

    if (!payroll) {
        throw new Error(
            "Payroll record not found"
        );
    }

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Get Employee Payroll
|--------------------------------------------------------------------------
|
| Employee can only see own payroll.
|
*/

const getMyPayroll = async ({
    userId,
    page = 1,
    limit = 12,
    year
} = {}) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const filter = {
        employeeId:
            employee.employeeId
    };

    if (year) {
        filter.year =
            Number(year);
    }

    const pageNumber =
        Number(page);

    const limitNumber =
        Number(limit);

    const skip =
        (pageNumber - 1) *
        limitNumber;

    const [
        payroll,
        total
    ] = await Promise.all([
        Payroll.find(filter)
            .sort({
                year: -1,
                month: -1
            })
            .skip(skip)
            .limit(limitNumber),

        Payroll.countDocuments(
            filter
        )
    ]);

    return {
        payroll,

        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages:
                Math.ceil(
                    total /
                    limitNumber
                )
        }
    };
};

/*
|--------------------------------------------------------------------------
| Get Employee Payroll By ID
|--------------------------------------------------------------------------
|
| Prevents Employee A from viewing
| Employee B's payroll.
|
*/

const getMyPayrollById = async ({
    userId,
    payrollId
}) => {
    const employee =
        await Employee.findOne({
            user: userId
        });

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    const payroll =
        await Payroll.findOne({
            _id: payrollId,

            employeeId:
                employee.employeeId
        });

    if (!payroll) {
        throw new Error(
            "Payroll record not found"
        );
    }

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Get All Payroll
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const getAllPayroll = async ({
    page = 1,
    limit = 20,
    employeeId,
    month,
    year,
    status
} = {}) => {
    const filter = {};

    if (employeeId) {
        filter.employeeId =
            normalizeEmployeeId(
                employeeId
            );
    }

    if (month) {
        filter.month =
            Number(month);
    }

    if (year) {
        filter.year =
            Number(year);
    }

    if (status) {
        filter.status =
            status;
    }

    const pageNumber =
        Number(page);

    const limitNumber =
        Number(limit);

    const skip =
        (pageNumber - 1) *
        limitNumber;

    const [
        payroll,
        total
    ] = await Promise.all([
        Payroll.find(filter)
            .sort({
                year: -1,
                month: -1
            })
            .skip(skip)
            .limit(limitNumber),

        Payroll.countDocuments(
            filter
        )
    ]);

    return {
        payroll,

        pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages:
                Math.ceil(
                    total /
                    limitNumber
                )
        }
    };
};

/*
|--------------------------------------------------------------------------
| Process Payroll
|--------------------------------------------------------------------------
|
| Admin only.
|
| Changes:
|
| draft → processed
|
*/

const processPayroll = async (
    payrollId
) => {
    const payroll =
        await Payroll.findById(
            payrollId
        );

    if (!payroll) {
        throw new Error(
            "Payroll record not found"
        );
    }

    if (
        payroll.status ===
        PAYROLL_STATUS.PROCESSED
    ) {
        throw new Error(
            "Payroll has already been processed"
        );
    }

    payroll.status =
        PAYROLL_STATUS.PROCESSED;

    payroll.processedAt =
        new Date();

    await payroll.save();

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Generate Salary Slip PDF
|--------------------------------------------------------------------------
*/

const generateSalarySlipPdf = (
    payroll,
    employee
) => {
    return new Promise(
        (resolve, reject) => {
            try {
                const document =
                    new PDFDocument({
                        size: "A4",
                        margin: 50
                    });

                const chunks = [];

                document.on(
                    "data",
                    (chunk) => {
                        chunks.push(
                            chunk
                        );
                    }
                );

                document.on(
                    "end",
                    () => {
                        resolve(
                            Buffer.concat(
                                chunks
                            )
                        );
                    }
                );

                document.on(
                    "error",
                    reject
                );

                /*
                 * Header
                 */
                document
                    .fontSize(24)
                    .text(
                        "DAYFLOW",
                        {
                            align: "center"
                        }
                    );

                document
                    .fontSize(16)
                    .text(
                        "Salary Slip",
                        {
                            align: "center"
                        }
                    );

                document.moveDown();

                /*
                 * Employee information
                 */
                document
                    .fontSize(11)
                    .text(
                        `Employee ID: ${employee.employeeId}`
                    );

                document.text(
                    `Employee Name: ${
                        employee.firstName || ""
                    } ${
                        employee.lastName || ""
                    }`
                );

                document.text(
                    `Department: ${
                        employee.department || "-"
                    }`
                );

                document.text(
                    `Designation: ${
                        employee.designation || "-"
                    }`
                );

                document.text(
                    `Month: ${
                        payroll.month
                    }/${payroll.year}`
                );

                document.moveDown();

                document
                    .fontSize(14)
                    .text(
                        "Earnings"
                    );

                document.moveDown(0.5);

                document
                    .fontSize(11)
                    .text(
                        `Basic Salary: ₹${payroll.basicSalary}`
                    );

                document.text(
                    `HRA: ₹${payroll.hra}`
                );

                document.text(
                    `Allowances: ₹${payroll.allowances}`
                );

                document.text(
                    `Bonuses: ₹${payroll.bonuses}`
                );

                document.moveDown();

                document
                    .fontSize(14)
                    .text(
                        "Deductions"
                    );

                document.moveDown(0.5);

                document
                    .fontSize(11)
                    .text(
                        `Deductions: ₹${payroll.deductions}`
                    );

                document.moveDown();

                document
                    .fontSize(14)
                    .text(
                        `Gross Salary: ₹${payroll.grossSalary}`
                    );

                document
                    .fontSize(16)
                    .text(
                        `Net Salary: ₹${payroll.netSalary}`
                    );

                document.moveDown();

                document
                    .fontSize(9)
                    .text(
                        "This salary slip was generated by Dayflow HRMS.",
                        {
                            align: "center"
                        }
                    );

                document.end();
            } catch (error) {
                reject(error);
            }
        }
    );
};

/*
|--------------------------------------------------------------------------
| Generate And Upload Salary Slip
|--------------------------------------------------------------------------
|
| Admin only.
|
*/

const generateSalarySlip = async (
    payrollId
) => {
    const payroll =
        await Payroll.findById(
            payrollId
        );

    if (!payroll) {
        throw new Error(
            "Payroll record not found"
        );
    }

    const employee =
        await getEmployee(
            payroll.employeeId
        );

    /*
     * Generate PDF.
     */
    const pdfBuffer =
        await generateSalarySlipPdf(
            payroll,
            employee
        );

    /*
     * Upload PDF to Cloudinary.
     */
    const uploadResult =
        await uploadSalarySlip(
            pdfBuffer,

            employee.employeeId,

            payroll.year,

            payroll.month
        );

    payroll.salarySlip = {
        url:
            uploadResult.secure_url,

        publicId:
            uploadResult.public_id
    };

    payroll.salarySlipGeneratedAt =
        new Date();

    await payroll.save();

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Send Salary Slip
|--------------------------------------------------------------------------
|
| Sends:
|
| 1. Email
| 2. In-app notification
|
*/

const sendSalarySlip = async (
    payrollId
) => {
    const payroll =
        await Payroll.findById(
            payrollId
        );

    if (!payroll) {
        throw new Error(
            "Payroll record not found"
        );
    }

    const employee =
        await getEmployee(
            payroll.employeeId
        );

    /*
     * Generate salary slip if it does
     * not already exist.
     */
    if (
        !payroll.salarySlip?.url
    ) {
        await generateSalarySlip(
            payrollId
        );

        /*
         * Reload updated payroll.
         */
        const updatedPayroll =
            await Payroll.findById(
                payrollId
            );

        payroll.salarySlip =
            updatedPayroll.salarySlip;
    }

    /*
     * In-app notification.
     */
    await Notification.create({
        employeeId:
            employee.employeeId,

        type: "payroll",

        title:
            "Salary Slip Available",

        message:
            `Your salary slip for ${payroll.month}/${payroll.year} is now available.`,

        read: false
    });

    /*
     * Email.
     */
    try {
        await sendSalarySlipEmail({
            email:
                employee.user.email,

            name:
                `${employee.firstName || ""} ${
                    employee.lastName || ""
                }`.trim(),

            employeeId:
                employee.employeeId,

            month:
                payroll.month,

            year:
                payroll.year,

            netSalary:
                payroll.netSalary,

            salarySlipUrl:
                payroll.salarySlip.url
        });
    } catch (error) {
        console.error(
            "Salary slip email failed:",
            error.message
        );

        /*
         * Payroll itself should remain valid
         * even if email delivery fails.
         */
    }

    payroll.salarySlipSentAt =
        new Date();

    await payroll.save();

    return payroll;
};

/*
|--------------------------------------------------------------------------
| Payroll Summary
|--------------------------------------------------------------------------
|
| Useful for Admin dashboard.
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

                    totalEmployees: {
                        $sum: 1
                    },

                    totalGrossSalary: {
                        $sum:
                            "$grossSalary"
                    },

                    totalDeductions: {
                        $sum:
                            "$deductions"
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
            totalEmployees: 0,
            totalGrossSalary: 0,
            totalDeductions: 0,
            totalNetSalary: 0
        }
    );
};

const deletePayroll = async (payrollId) => {
    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
        throw new Error("Payroll not found");
    }

    await Payroll.deleteOne({ _id: payroll._id });

    return { message: "Payroll deleted successfully" };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    calculateSalary,

    createPayroll,
    updatePayroll,
    deletePayroll,

    getPayrollById,
    getMyPayroll,
    getMyPayrollById,
    getAllPayroll,

    processPayroll,

    generateSalarySlip,
    sendSalarySlip,

    getPayrollSummary
};
