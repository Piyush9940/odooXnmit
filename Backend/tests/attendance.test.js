import request from "supertest";
import mongoose from "mongoose";

import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import { hashPassword } from "../utils/password.js";

describe("Attendance API", () => {
    let adminUser;
    let employeeUser;
    let employeeProfile;
    let adminToken;
    let employeeToken;

    const timestamp = Date.now();

    const adminData = {
        name: "Attendance Admin",
        employeeId: `ADM${timestamp}`,
        email: `att-admin-${timestamp}@example.com`,
        password: "Admin@12345",
        role: "admin"
    };

    const employeeData = {
        name: "Attendance Employee",
        employeeId: `EMP${timestamp}`,
        email: `att-employee-${timestamp}@example.com`,
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
                firstName: "Attendance",
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
            await Attendance.deleteMany({ employee: employeeProfile._id });
            await Employee.findByIdAndDelete(employeeProfile._id);
        }
        await User.deleteMany({
            email: { $in: [adminData.email, employeeData.email] }
        });
    });

    describe("POST /api/attendance/check-in", () => {
        test("should allow employee to check in", async () => {
            const response = await request(app)
                .post("/api/attendance/check-in")
                .set("Authorization", `Bearer ${employeeToken}`)
                .send({ workMode: "office" });

            expect([200, 201]).toContain(response.statusCode);
            expect(response.body).toHaveProperty("success", true);
        });

        test("should reject check-in without authentication", async () => {
            const response = await request(app)
                .post("/api/attendance/check-in")
                .send({ workMode: "office" });

            expect(response.statusCode).toBe(401);
        });
    });

    describe("POST /api/attendance/check-out", () => {
        test("should allow employee to check out", async () => {
            const response = await request(app)
                .post("/api/attendance/check-out")
                .set("Authorization", `Bearer ${employeeToken}`)
                .send({});

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("GET /api/attendance/me", () => {
        test("should allow employee to view own attendance history", async () => {
            const response = await request(app)
                .get("/api/attendance/me")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("GET /api/attendance/me/summary", () => {
        test("should allow employee to view own attendance summary", async () => {
            const response = await request(app)
                .get("/api/attendance/me/summary")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("GET /api/attendance", () => {
        test("should allow admin to view all attendance records", async () => {
            const response = await request(app)
                .get("/api/attendance")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });

        test("should reject non-admin from viewing all attendance records", async () => {
            const response = await request(app)
                .get("/api/attendance")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect([401, 403]).toContain(response.statusCode);
        });
    });
});
