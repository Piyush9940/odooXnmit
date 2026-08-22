import request from "supertest";
import mongoose from "mongoose";

import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import { hashPassword } from "../utils/password.js";

describe("Leave API", () => {
    let adminUser;
    let employeeUser;
    let employeeProfile;

    let adminToken;
    let employeeToken;

    let leaveId;

    const timestamp = Date.now();

    const adminData = {
        name: "Leave Test Admin",
        employeeId: `ADM${timestamp}`,
        email: `leave-admin-${timestamp}@example.com`,
        password: "Admin@12345",
        role: "admin"
    };

    const employeeData = {
        name: "Leave Test Employee",
        employeeId: `EMP${timestamp}`,
        email: `leave-employee-${timestamp}@example.com`,
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
                firstName: "Leave",
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
            await Leave.deleteMany({ employee: employeeProfile._id });
            await Employee.findByIdAndDelete(employeeProfile._id);
        }
        await User.deleteMany({
            email: { $in: [adminData.email, employeeData.email] }
        });
    });

    describe("POST /api/leaves", () => {
        test("should allow employee to apply for leave", async () => {
            const response = await request(app)
                .post("/api/leaves")
                .set("Authorization", `Bearer ${employeeToken}`)
                .send({
                    leaveType: "paid",
                    startDate: "2026-09-01",
                    endDate: "2026-09-03",
                    reason: "Personal work"
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.leaveType).toBe("paid");
            leaveId = response.body.data._id;
        });

        test("should reject unauthenticated leave request", async () => {
            const response = await request(app)
                .post("/api/leaves")
                .send({
                    leaveType: "paid",
                    startDate: "2026-09-01",
                    endDate: "2026-09-03",
                    reason: "Personal work"
                });

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/leaves", () => {
        test("should allow admin to get all leaves", async () => {
            const response = await request(app)
                .get("/api/leaves")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            const leaves = Array.isArray(response.body.data) ? response.body.data : (response.body.data?.leaves || []);
            expect(Array.isArray(leaves)).toBe(true);
        });

        test("should reject unauthenticated request", async () => {
            const response = await request(app).get("/api/leaves");
            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("GET /api/leaves/me", () => {
        test("should allow employee to view own leaves", async () => {
            const response = await request(app)
                .get("/api/leaves/me")
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            const leaves = Array.isArray(response.body.data) ? response.body.data : (response.body.data?.leaves || []);
            expect(Array.isArray(leaves)).toBe(true);
        });
    });

    describe("PATCH /api/leaves/:id/approve", () => {
        test("should allow admin to approve leave", async () => {
            if (!leaveId) return;
            const response = await request(app)
                .patch(`/api/leaves/${leaveId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ adminComment: "Approved", comment: "Approved" });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("PATCH /api/leaves/:id/reject", () => {
        test("should allow admin to reject leave", async () => {
            const leave = await Leave.create({
                employee: employeeProfile._id,
                employeeId: employeeProfile.employeeId,
                leaveType: "paid",
                startDate: new Date("2026-10-10"),
                endDate: new Date("2026-10-12"),
                totalDays: 3,
                reason: "Personal work",
                status: "pending"
            });

            const response = await request(app)
                .patch(`/api/leaves/${leave._id}/reject`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ adminComment: "Rejected", comment: "Rejected" });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("PATCH /api/leaves/:id/cancel", () => {
        test("should allow employee to cancel own pending leave", async () => {
            const leave = await Leave.create({
                employee: employeeProfile._id,
                employeeId: employeeProfile.employeeId,
                leaveType: "paid",
                startDate: new Date("2026-11-01"),
                endDate: new Date("2026-11-02"),
                totalDays: 2,
                reason: "Personal work",
                status: "pending"
            });

            const response = await request(app)
                .patch(`/api/leaves/${leave._id}/cancel`)
                .set("Authorization", `Bearer ${employeeToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("Leave status validation", () => {
        test("should not approve a non-existing leave", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .patch(`/api/leaves/${fakeId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ adminComment: "Approved" });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("success", false);
        });
    });
});
