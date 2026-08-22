const successResponse = (
    res,
    statusCode = 200,
    message = "Request successful",
    data = null
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        error: null
    });
};

const errorResponse = (
    res,
    statusCode = 500,
    message = "Something went wrong",
    error = null
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        error
    });
};

const validationErrorResponse = (
    res,
    errors,
    message = "Validation failed"
) => {
    return res.status(400).json({
        success: false,
        message,
        data: null,
        error: errors
    });
};

const unauthorizedResponse = (
    res,
    message = "Authentication required",
    error = "Unauthorized"
) => {
    return res.status(401).json({
        success: false,
        message,
        data: null,
        error
    });
};

const forbiddenResponse = (
    res,
    message = "Access denied",
    error = "Insufficient permissions"
) => {
    return res.status(403).json({
        success: false,
        message,
        data: null,
        error
    });
};

const notFoundResponse = (
    res,
    message = "Resource not found",
    error = null
) => {
    return res.status(404).json({
        success: false,
        message,
        data: null,
        error
    });
};

const conflictResponse = (
    res,
    message = "Resource already exists",
    error = null
) => {
    return res.status(409).json({
        success: false,
        message,
        data: null,
        error
    });
};

export {
    successResponse,
    errorResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse
};