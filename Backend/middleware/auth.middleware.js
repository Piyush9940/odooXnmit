import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                data: null,
                error: "Authorization header is missing"
            });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication format",
                data: null,
                error: "Use Bearer token format"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                data: null,
                error: "Token is missing"
            });
        }

        const jwtSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                success: false,
                message: "Server configuration error",
                data: null,
                error: "Authentication service is not configured"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                jwtSecret
            );
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Session expired",
                    data: null,
                    error: "JWT token has expired"
                });
            }

            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token",
                    data: null,
                    error: "JWT token is invalid"
                });
            }

            throw error;
        }

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
                data: null,
                error: "User information is missing from token"
            });
        }

        const user = await User.findById(decoded.userId)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                data: null,
                error: "Authenticated user does not exist"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Account is not active",
                data: null,
                error: "Please contact the administrator"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error(
            "Authentication middleware error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
            data: null,
            error: "Internal server error"
        });
    }
};

export default authMiddleware;
