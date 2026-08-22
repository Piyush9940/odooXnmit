import request from "supertest";
import mongoose from "mongoose";

import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Notification from "../models/Notification.js";
import { hashPassword } from "../utils/password.js";

describe("Notification API", () => {
    let adminUser;
    let employeeUser;
    let employeeProfile;
    let adminToken;
    let employeeToken;

    const timestamp = Date.now();

    const adminData = {
        name: "Notification Admin",
        employeeId: `ADM${timestamp}`,
        email: `notif-admin-${timestamp}@example.com`,
        password: "Admin@12345",
        role: "admin"
    };

    const employeeData = {
        name: "Notification Employee",
        employeeId: `EMP${timestamp}`,
        email: `notif-employee-${timestamp}@example.com`,
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
                firstName: "Notification",
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
            await Notification.deleteMany({ recipient: employeeProfile._id });
            await Employee.findByIdAndDelete(employeeProfile._id);
        }
        await User.deleteMany({
            email: { $in: [adminData.email, employeeData.email] }
        });
    });

    describe("GET /api/notifications/me", () => {
        test("should allow employee to get own notifications", async () => {
            const response = await request(app)
                .get("/api/notifications/me")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });

        test("should reject unauthenticated request", async () => {
            const response = await request(app).get("/api/notifications/me");
            expect(response.statusCode).toBe(401);
        });
    });

    describe("POST /api/notifications/employee/:employeeId", () => {
        test("should allow admin to send notification to employee", async () => {
            const response = await request(app)
                .post(`/api/notifications/employee/${employeeProfile.employeeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    employeeId: employeeProfile.employeeId,
                    title: "Test Notice",
                    message: "Please complete profile details",
                    type: "general"
                });

            expect([200, 201]).toContain(response.statusCode);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("PATCH /api/notifications/me/read-all", () => {
        test("should allow employee to mark all notifications as read", async () => {
            const response = await request(app)
                .patch("/api/notifications/me/read-all")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });
});
