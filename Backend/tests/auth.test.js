import request from "supertest";

import app from "../app.js";
import User from "../models/User.js";
import EmailVerification from "../models/EmailVerification.js";
import { hashPassword } from "../utils/password.js";

describe("Auth API", () => {
    const testUser = {
        name: "Test Employee",
        employeeId: `EMP${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        password: "Test@12345",
        role: "employee"
    };

    let accessToken;
    let userId;
    let hashedPassword;

    beforeAll(async () => {
        hashedPassword = await hashPassword(testUser.password);
    });

    afterEach(async () => {
        if (testUser.email) {
            await User.deleteMany({
                email: testUser.email
            });
        }

        if (userId) {
            await EmailVerification.deleteMany({
                user: userId
            });
        }
    });

    // ==========================================
    // REGISTER
    // ==========================================

    describe("POST /api/auth/register", () => {
        test("should register a new user", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    employeeId: testUser.employeeId,
                    email: testUser.email,
                    password: testUser.password,
                    role: testUser.role
                });

            expect(response.statusCode).toBe(201);

            expect(response.body).toHaveProperty("success", true);

            expect(response.body).toHaveProperty("message");

            expect(response.body.data).toBeDefined();

            const user = await User.findOne({
                email: testUser.email
            });

            expect(user).not.toBeNull();

            expect(user.email).toBe(
                testUser.email.toLowerCase()
            );

            expect(user.employeeId).toBe(testUser.employeeId);
        });

        test("should reject duplicate email", async () => {
            await User.create({
                name: testUser.name,
                employeeId: testUser.employeeId,
                email: testUser.email,
                password: hashedPassword,
                role: testUser.role,
                emailVerified: true
            });

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    employeeId: testUser.employeeId,
                    email: testUser.email,
                    password: testUser.password,
                    role: testUser.role
                });

            expect(response.statusCode).toBe(409);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject invalid email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Invalid User",
                    email: "invalid-email",
                    password: "Test@12345"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject weak password", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Weak Password User",
                    email: `weak-${Date.now()}@example.com`,
                    password: "123"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject missing required fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });
    });

    // ==========================================
    // LOGIN
    // ==========================================

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
            await User.create({
                    name: testUser.name,
                    employeeId: testUser.employeeId,
                    email: testUser.email,
                    password: hashedPassword,
                    role: testUser.role,
                    emailVerified: true
            });
        });

        test("should login with valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty(
                "success",
                true
            );

            expect(response.body.data).toBeDefined();

            expect(
                response.body.data.accessToken
            ).toBeDefined();

            accessToken =
                response.body.data.accessToken;

            expect(typeof accessToken).toBe("string");
        });

        test("should reject incorrect password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "Wrong@12345"
                });

            expect(response.statusCode).toBe(401);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject non-existing user", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "doesnotexist@example.com",
                    password: "Test@12345"
                });

            expect(response.statusCode).toBe(401);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject missing login credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });
    });

    // ==========================================
    // CURRENT USER
    // ==========================================

    describe("GET /api/auth/me", () => {
        beforeEach(async () => {
            const user = await User.create({
                name: testUser.name,
                employeeId: testUser.employeeId,
                email: testUser.email,
                password: hashedPassword,
                role: testUser.role,
                emailVerified: true
            });

            userId = user._id;

            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            accessToken =
                loginResponse.body.data.accessToken;
        });

        test("should return authenticated user", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty(
                "success",
                true
            );

            expect(response.body.data).toBeDefined();
        });

        test("should reject request without token", async () => {
            const response = await request(app)
                .get("/api/auth/me");

            expect(response.statusCode).toBe(401);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject invalid token", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set(
                    "Authorization",
                    "Bearer invalid-token"
                );

            expect(response.statusCode).toBe(401);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });
    });

    // ==========================================
    // EMAIL VERIFICATION
    // ==========================================

    describe("POST /api/auth/verify-email", () => {
        beforeEach(async () => {
            const user = await User.create({
                name: testUser.name,
                employeeId: testUser.employeeId,
                email: testUser.email,
                password: hashedPassword,
                role: testUser.role,
                emailVerified: false
            });

            userId = user._id;
        });

        test("should reject invalid verification token", async () => {
            const response = await request(app)
                .post("/api/auth/verify-email")
                .send({
                    token: "invalid-verification-token"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject missing verification token", async () => {
            const response = await request(app)
                .post("/api/auth/verify-email")
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });
    });

    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    describe("POST /api/auth/forgot-password", () => {
        beforeEach(async () => {
            await User.create({
                name: testUser.name,
                employeeId: testUser.employeeId,
                email: testUser.email,
                password: hashedPassword,
                role: testUser.role,
                emailVerified: true
            });
        });

        test("should accept forgot password request", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({
                    email: testUser.email
                });

            expect([200, 202]).toContain(
                response.statusCode
            );

            expect(response.body).toHaveProperty(
                "success",
                true
            );
        });

        test("should handle unknown email", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({
                    email: "unknown@example.com"
                });

            expect([200, 202, 404]).toContain(
                response.statusCode
            );

            expect(response.body).toHaveProperty(
                "success"
            );
        });

        test("should reject missing email", async () => {
            const response = await request(app)
                .post("/api/auth/forgot-password")
                .send({});

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });
    });

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    describe("POST /api/auth/reset-password", () => {
        test("should reject invalid reset token", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    token: "invalid-reset-token",
                    password: "NewPassword@123"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject missing token", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    password: "NewPassword@123"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });

        test("should reject weak new password", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    token: "invalid-reset-token",
                    password: "123"
                });

            expect(response.statusCode).toBe(400);

            expect(response.body).toHaveProperty(
                "success",
                false
            );
        });
    });
});
