import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import documentRoutes from "./routes/document.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";

import errorHandler from "./middleware/error.middleware.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Security & CORS Middleware
|--------------------------------------------------------------------------
*/

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

/*
|--------------------------------------------------------------------------
| Request Middleware
|--------------------------------------------------------------------------
*/

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);

app.use(
    cookieParser()
);

if (process.env.NODE_ENV !== "test") {
    app.use(
        morgan("dev")
    );
}

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
    "/",
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Dayflow API is running",
            environment: process.env.NODE_ENV || "development"
        });
    }
);

app.get(
    "/api/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Server is healthy",
            timestamp: new Date().toISOString()
        });
    }
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/leaves",
    leaveRoutes
);

app.use(
    "/api/payroll",
    payrollRoutes
);

app.use(
    "/api/documents",
    documentRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/reports",
    reportRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message: `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    errorHandler
);

export default app;
