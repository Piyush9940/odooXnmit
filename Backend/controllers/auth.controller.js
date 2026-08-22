import {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    changePassword,
    logoutUser
} from "../services/auth.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
| POST /api/auth/register
| Public
|--------------------------------------------------------------------------
*/

const register = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await registerUser(
                req.body
            );

        return successResponse(
            res,
            201,
            "Registration successful. Please verify your email.",
            result
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
| POST /api/auth/login
| Public
|--------------------------------------------------------------------------
*/

const login = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await loginUser(
                req.body
            );

        return successResponse(
            res,
            200,
            "Login successful",
            result
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Verify Email
|--------------------------------------------------------------------------
| GET /api/auth/verify-email?token=...
| Public
|--------------------------------------------------------------------------
*/

const verifyEmailController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                token
            } = req.query;

            const result =
                await verifyEmail(
                    token
                );

            return successResponse(
                res,
                200,
                "Email verified successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Resend Verification Email
|--------------------------------------------------------------------------
| POST /api/auth/resend-verification
| Public
|--------------------------------------------------------------------------
*/

const resendVerification =
    async (
        req,
        res,
        next
    ) => {
        try {
            const result =
                await resendVerificationEmail(
                    req.body.email
                );

            return successResponse(
                res,
                200,
                "Verification email sent successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
| POST /api/auth/forgot-password
| Public
|--------------------------------------------------------------------------
*/

const forgotPasswordController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const result =
                await forgotPassword(
                    req.body.email
                );

            return successResponse(
                res,
                200,
                "If the email exists, a password reset link has been sent.",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
| POST /api/auth/reset-password
| Public
|--------------------------------------------------------------------------
*/

const resetPasswordController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                token,
                password
            } = req.body;

            const result =
                await resetPassword(
                    token,
                    password
                );

            return successResponse(
                res,
                200,
                "Password reset successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
| GET /api/auth/me
| Protected
|--------------------------------------------------------------------------
*/

const getMe = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getCurrentUser(
                req.user.id
            );

        return successResponse(
            res,
            200,
            "User fetched successfully",
            result
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
| PATCH /api/auth/change-password
| Protected
|--------------------------------------------------------------------------
*/

const changePasswordController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                currentPassword,
                newPassword
            } = req.body;

            const result =
                await changePassword({
                    userId:
                        req.user.id,

                    currentPassword,

                    newPassword
                });

            return successResponse(
                res,
                200,
                "Password changed successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
| POST /api/auth/logout
| Protected
|--------------------------------------------------------------------------
*/

const logout = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await logoutUser(
                req.user.id
            );

        return successResponse(
            res,
            200,
            "Logout successful",
            result
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    register,
    login,
    verifyEmailController,
    resendVerification,
    forgotPasswordController,
    resetPasswordController,
    getMe,
    changePasswordController,
    logout
};