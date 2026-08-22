const validationMiddleware = (validator) => {
    return (req, res, next) => {
        try {
            if (typeof validator !== "function") {
                console.error(
                    "Validation middleware requires a validator function"
                );

                return res.status(500).json({
                    success: false,
                    message: "Validation configuration error",
                    data: null,
                    error: "Invalid validator"
                });
            }

            const result = validator(req);

            if (!result || result.isValid === false) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    data: null,
                    error: result?.errors || "Invalid request data"
                });
            }

            next();

        } catch (error) {
            console.error(
                "Validation middleware error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Request validation failed",
                data: null,
                error: "Internal server error"
            });
        }
    };
};

export default validationMiddleware;