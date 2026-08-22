const errorMiddleware = (err, req, res, next) => {
    console.error("Error:", {
        message: err.message,
        method: req.method,
        url: req.originalUrl,
        stack: process.env.NODE_ENV === "development"
            ? err.stack
            : undefined
    });

    // MongoDB / Mongoose Validation Error
    if (err.name === "ValidationError") {
        const errors = {};

        Object.keys(err.errors).forEach((field) => {
            errors[field] = err.errors[field].message;
        });

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            data: null,
            error: errors
        });
    }

    // MongoDB / Mongoose Cast Error
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid data format",
            data: null,
            error: `Invalid value for ${err.path}`
        });
    }

    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const duplicateField = Object.keys(
            err.keyPattern || {}
        )[0];

        return res.status(409).json({
            success: false,
            message: "Duplicate data",
            data: null,
            error: duplicateField
                ? `${duplicateField} already exists`
                : "Duplicate value already exists"
        });
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token",
            data: null,
            error: "Authentication failed"
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Authentication token expired",
            data: null,
            error: "Please login again"
        });
    }

    // Multer File Upload Errors
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds the allowed limit",
                data: null,
                error: "Uploaded file is too large"
            });
        }

        return res.status(400).json({
            success: false,
            message: "File upload failed",
            data: null,
            error: err.message
        });
    }

    // Custom Application Error
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message || "Request failed",
            data: null,
            error: err.error || null
        });
    }

    if (err.message && err.message.toLowerCase().includes("not found")) {
        return res.status(404).json({
            success: false,
            message: err.message,
            data: null,
            error: null
        });
    }

    const clientErrorMessages = [
        "Email is already registered",
        "Employee ID is already registered",
        "Invalid email or password",
        "Invalid or expired verification token"
    ];

    if (clientErrorMessages.includes(err.message)) {
        const statusCode = err.message === "Email is already registered" ||
            err.message === "Employee ID is already registered"
            ? 409
            : err.message === "Invalid email or password"
                ? 401
                : 400;

        return res.status(statusCode).json({
            success: false,
            message: err.message,
            data: null,
            error: null
        });
    }

    // Default Error
    return res.status(500).json({
        success: false,
        message: "Internal server error",
        data: null,
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Something went wrong"
    });
};

export default errorMiddleware;
