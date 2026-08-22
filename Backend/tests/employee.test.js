import request from "supertest";
import mongoose from "mongoose";

import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { hashPassword } from "../utils/password.js";

describe("Employee API", () => {
    let adminUser;
    let employeeUser;
    let adminToken;
    let employeeToken;
    let employeeId;
    let employeeMongoId;

    const adminData = {
        name: "Test Admin",
        employeeId: `ADM${Date.now()}`,
        email: `admin-${Date.now()}@example.com`,
        password: "Admin@12345",
        role: "admin"
    };

    const employeeData = {
        name: "Test Employee",
        employeeId: `EMP${Date.now()}`,
        email: `employee-${Date.now()}@example.com`,
        password: "Employee@12345",
        role: "employee"
    };

    let empCounter = 1000;
    const buildEmployee = (user = new mongoose.Types.ObjectId()) => ({
        user,
        employeeId: `EMP${empCounter++}${Math.floor(100 + Math.random() * 899)}`,
        personalDetails: {
            firstName: "Test",
            lastName: "Employee",
            phone: "9876543210",
            gender: "male",
            address: { city: "Bengaluru", state: "Karnataka", postalCode: "560001" }
        },
        jobDetails: {
            department: "Engineering",
            designation: "Software Engineer",
            joiningDate: new Date("2026-01-01"),
            employmentType: "full-time"
        },
        salaryStructure: { basicSalary: 30000, allowances: 5000, deductions: 3000, grossSalary: 35000, netSalary: 32000 }
    });

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
        await Employee.deleteMany({});
        await User.deleteMany({
            email: { $in: [adminData.email, employeeData.email] }
        });
    });

    describe("POST /api/employees", () => {
        test("should create employee as admin", async () => {
            const empData = {
                employeeId: `EMP${Math.floor(100 + Math.random() * 899)}`,
                email: `empnew-${Date.now()}@example.com`,
                password: "Password@12345",
                personalDetails: {
                    firstName: "New",
                    lastName: "Emp",
                    phone: "9876543210",
                    gender: "male"
                },
                jobDetails: {
                    department: "Engineering",
                    designation: "Software Engineer",
                    joiningDate: "2026-01-01",
                    employmentType: "full-time"
                },
                salaryStructure: {
                    basicSalary: 30000,
                    allowances: 5000,
                    deductions: 3000
                }
            };
            const response = await request(app)
                .post("/api/employees")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(empData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("success", true);
            employeeId = response.body.data.employeeId;
            employeeMongoId = response.body.data._id;
        });

        test("should reject employee creation without authentication", async () => {
            const response = await request(app)
                .post("/api/employees")
                .send({});
            expect(response.statusCode).toBe(401);
        });

        test("should reject employee creation by normal employee", async () => {
            const response = await request(app)
                .post("/api/employees")
                .set("Authorization", `Bearer ${employeeToken}`)
                .send({});
            expect(response.statusCode).toBe(403);
        });

        test("should reject invalid employee data", async () => {
            const response = await request(app)
                .post("/api/employees")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ invalid: true });
            expect(response.statusCode).toBe(400);
        });
    });

    describe("GET /api/employees", () => {
        test("should get all employees as admin", async () => {
            const response = await request(app)
                .get("/api/employees")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            const employees = Array.isArray(response.body.data) ? response.body.data : (response.body.data?.employees || []);
            expect(Array.isArray(employees)).toBe(true);
        });

        test("should reject unauthenticated request", async () => {
            const response = await request(app).get("/api/employees");
            expect(response.statusCode).toBe(401);
        });
    });

    describe("GET /api/employees/:id", () => {
        let currentEmp;
        beforeEach(async () => {
            currentEmp = await Employee.create(buildEmployee());
            employeeMongoId = currentEmp._id;
            employeeId = currentEmp.employeeId;
        });

        test("should get employee by ID", async () => {
            const response = await request(app)
                .get(`/api/employees/${employeeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data).toBeDefined();
        });

        test("should reject invalid MongoDB ID or employee ID", async () => {
            const response = await request(app)
                .get("/api/employees/INVALID_EMP_ID")
                .set("Authorization", `Bearer ${adminToken}`);

            expect([400, 404]).toContain(response.statusCode);
        });

        test("should return 404 for non-existing employee", async () => {
            const response = await request(app)
                .get("/api/employees/EMP999999")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe("PUT /api/employees/:id", () => {
        let currentEmp;
        beforeEach(async () => {
            currentEmp = await Employee.create(buildEmployee());
            employeeMongoId = currentEmp._id;
            employeeId = currentEmp.employeeId;
        });

        test("should update employee as admin", async () => {
            const response = await request(app)
                .patch(`/api/employees/${employeeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ personalDetails: { firstName: "UpdatedName", lastName: "Employee" } });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });

        test("should reject update without authentication", async () => {
            const response = await request(app)
                .patch(`/api/employees/${employeeId}`)
                .send({ personalDetails: { firstName: "UpdatedName", lastName: "Employee" } });

            expect(response.statusCode).toBe(401);
        });

        test("should reject employee role from updating another employee", async () => {
            const response = await request(app)
                .patch(`/api/employees/${employeeId}`)
                .set("Authorization", `Bearer ${employeeToken}`)
                .send({ personalDetails: { firstName: "UpdatedName", lastName: "Employee" } });

            expect([401, 403]).toContain(response.statusCode);
        });
    });

    describe("DELETE /api/employees/:id", () => {
        let currentEmp;
        beforeEach(async () => {
            currentEmp = await Employee.create(buildEmployee());
            employeeMongoId = currentEmp._id;
            employeeId = currentEmp.employeeId;
        });

        test("should delete employee as admin", async () => {
            const response = await request(app)
                .delete(`/api/employees/${employeeId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
        });

        test("should reject delete without authentication", async () => {
            const response = await request(app)
                .delete(`/api/employees/${employeeId}`);

            expect(response.statusCode).toBe(401);
        });

        test("should reject employee from deleting employee", async () => {
            const response = await request(app)
                .delete(`/api/employees/${employeeId}`)
                .set("Authorization", `Bearer ${employeeToken}`);

            expect([401, 403]).toContain(response.statusCode);
        });

        test("should return 404 for non-existing employee", async () => {
            const response = await request(app)
                .delete("/api/employees/EMP999999")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(404);
        });
    });
});
