import request from "supertest";
import mongoose from "mongoose";

import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import { hashPassword } from "../utils/password.js";

describe("Payroll API", () => {
    let adminUser;
    let employeeUser;
    let employeeProfile;
    let adminToken;
    let employeeToken;

    const timestamp = Date.now();

    const adminData = {
        name: "Payroll Admin",
        employeeId: `ADM${timestamp}`,
        email: `pay-admin-${timestamp}@example.com`,
        password: "Admin@12345",
        role: "admin"
    };

    const employeeData = {
        name: "Payroll Employee",
        employeeId: `EMP${timestamp}`,
        email: `pay-employee-${timestamp}@example.com`,
        password: "Employee@12345",
        role: "employee"
    };

    beforeAll(async () => {
        adminUser = await User.create({
            name: adminData.name,
            employeeId: adminData.employeeId,
            email: adminData.email,
            password: await hashPassword(adminData.password),
            role: adminData.role,
            emailVerified: true
        });

        employeeUser = await User.create({
            name: employeeData.name,
            employeeId: employeeData.employeeId,
            email: employeeData.email,
            password: await hashPassword(employeeData.password),
            role: employeeData.role,
            emailVerified: true
        });

        employeeProfile = await Employee.create({
            user: employeeUser._id,
            employeeId: employeeData.employeeId,
            personalDetails: {
                firstName: "Payroll",
                lastName: "Employee",
                phone: "9876543210",
                gender: "male"
            },
            jobDetails: {
                department: "Engineering",
                designation: "Software Engineer",
                joiningDate: new Date("2026-01-01"),
                employmentType: "full-time"
            },
            salaryStructure: {
                basicSalary: 30000,
                allowances: 5000,
                deductions: 3000,
                grossSalary: 35000,
                netSalary: 32000
            },
            isActive: true
        });

        const adminLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: adminData.email,
                password: adminData.password
            });
        expect(adminLogin.statusCode).toBe(200);
        adminToken = adminLogin.body.data.accessToken;

        const employeeLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: employeeData.email,
                password: employeeData.password
            });
        expect(employeeLogin.statusCode).toBe(200);
        employeeToken = employeeLogin.body.data.accessToken;
    });

    afterAll(async () => {
        if (employeeProfile?._id) {
            await Payroll.deleteMany({ employee: employeeProfile._id });
            await Employee.findByIdAndDelete(employeeProfile._id);
        }
        await User.deleteMany({
            email: { $in: [adminData.email, employeeData.email] }
        });
    });

    describe("POST /api/payroll", () => {
        test("should create payroll as admin", async () => {
            const payrollData = {
                employeeId: employeeProfile.employeeId,
                payrollMonth: 8,
                payrollYear: 2026,
                salaryStructure: {
                    basicSalary: 30000,
                    allowances: 5000,
                    deductions: 3000
                }
            };

            const response = await request(app)
                .post("/api/payroll")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(payrollData);

            expect([200, 201]).toContain(response.statusCode);
            expect(response.body).toHaveProperty("success", true);
        });

        test("should reject payroll creation without authentication", async () => {
            const response = await request(app).post("/api/payroll").send({});
            expect(response.statusCode).toBe(401);
        });
    });

    describe("GET /api/payroll/me", () => {
        test("should allow employee to get own payroll", async () => {
            const response = await request(app)
                .get("/api/payroll/me")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("GET /api/payroll", () => {
        test("should allow admin to view all payrolls", async () => {
            const response = await request(app)
                .get("/api/payroll")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });
});
