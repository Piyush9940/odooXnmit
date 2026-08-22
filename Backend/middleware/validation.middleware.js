const validationMiddleware = (validator) => {
    return (req, res, next) => {
        try {
            if (
                typeof validator !== "function" &&
                typeof validator?.validate !== "function"
            ) {
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

            if (typeof validator?.validate === "function") {
                const source = ["GET", "DELETE"].includes(req.method)
                    ? req.query
                    : req.body;

                const { error, value } = validator.validate(source, {
                    abortEarly: false,
                    stripUnknown: true
                });

                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Validation failed",
                        data: null,
                        error: error.details.map((detail) => detail.message)
                    });
                }

                if (!["GET", "DELETE"].includes(req.method)) {
                    req.body = value;
                }

                return next();
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
