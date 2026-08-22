import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Connected to MongoDB");

        // Clear existing seed users
        await User.deleteMany({
            email: {
                $in: [
                    "admin@dayflow.com",
                    "hr@dayflow.com",
                    "employee@dayflow.com"
                ]
            }
        });

        await Employee.deleteMany({
            email: {
                $in: [
                    "admin@dayflow.com",
                    "hr@dayflow.com",
                    "employee@dayflow.com"
                ]
            }
        });

        // =========================
        // ADMIN
        // =========================

        const admin = await User.create({
            name: "Dayflow Admin",
            email: "admin@dayflow.com",
            password: "Admin@12345",
            role: "ADMIN",
            isEmailVerified: true,
            isActive: true
        });

        console.log("Admin created:", admin.email);

        // =========================
        // HR
        // =========================

        const hr = await User.create({
            name: "Dayflow HR",
            email: "hr@dayflow.com",
            password: "Hr@12345",
            role: "HR",
            isEmailVerified: true,
            isActive: true
        });

        console.log("HR created:", hr.email);

        // =========================
        // EMPLOYEE USER
        // =========================

        const employeeUser = await User.create({
            name: "Piyush Kumar",
            email: "employee@dayflow.com",
            password: "Employee@12345",
            role: "EMPLOYEE",
            isEmailVerified: true,
            isActive: true
        });

        console.log("Employee user created:", employeeUser.email);

        // =========================
        // EMPLOYEE PROFILE
        // =========================

        const employee = await Employee.create({
            user: employeeUser._id,

            employeeId: "EMP001",

            firstName: "Piyush",
            lastName: "Kumar",

            email: "employee@dayflow.com",

            phone: "9876543210",

            dateOfBirth: new Date("2004-01-15"),

            gender: "MALE",

            department: "Engineering",

            designation: "Software Engineer",

            joiningDate: new Date("2026-01-01"),

            employmentType: "FULL_TIME",

            salary: {
                basic: 30000,
                allowances: 5000,
                deductions: 3000,
                gross: 35000,
                net: 32000
            },

            address: {
                street: "Main Street",
                city: "Bengaluru",
                state: "Karnataka",
                country: "India",
                postalCode: "560001"
            },

            isActive: true
        });

        console.log(
            "Employee profile created:",
            employee.employeeId
        );

        console.log("\n=================================");
        console.log("Database seeded successfully");
        console.log("=================================\n");

        console.log("Login credentials:");
        console.log("---------------------------------");

        console.log("ADMIN");
        console.log("Email: admin@dayflow.com");
        console.log("Password: Admin@12345");

        console.log("\nHR");
        console.log("Email: hr@dayflow.com");
        console.log("Password: Hr@12345");

        console.log("\nEMPLOYEE");
        console.log("Email: employee@dayflow.com");
        console.log("Password: Employee@12345");

        console.log("---------------------------------");

        await mongoose.connection.close();

        console.log("\nMongoDB connection closed");

        process.exit(0);

    } catch (error) {

        console.error("\nDatabase seeding failed");

        console.error(error);

        try {
            await mongoose.connection.close();
        } catch (closeError) {
            console.error(
                "Failed to close MongoDB connection:",
                closeError.message
            );
        }

        process.exit(1);
    }
};

seedDatabase();
