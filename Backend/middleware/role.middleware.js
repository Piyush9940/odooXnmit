const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                    data: null,
                    error: "User information is missing"
                });
            }

            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: "User role is not defined",
                    data: null,
                    error: "Access denied"
                });
            }

            const validRoles = ["admin", "employee"];

            if (!validRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid user role",
                    data: null,
                    error: "Access denied"
                });
            }

            if (allowedRoles.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Role configuration error",
                    data: null,
                    error: "No allowed roles were specified"
                });
            }

            const hasPermission = allowedRoles.includes(
                req.user.role
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this resource",
                    data: null,
                    error: "Insufficient permissions"
                });
            }

            next();

        } catch (error) {
            console.error(
                "Role middleware error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Authorization failed",
                data: null,
                error: "Internal server error"
            });
        }
    };
};

export default roleMiddleware;