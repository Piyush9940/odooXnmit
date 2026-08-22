import express from "express";

import {
    registerController,
    verifyEmailController,
    loginController,
    logoutController,
    refreshTokenController,
    forgotPasswordController,
    resetPasswordController,
    getCurrentUserController
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import rateLimitMiddleware from "../middlewares/rateLimit.middleware.js";
import validate from "../middlewares/validation.middleware.js";

import {
    registerValidator,
    loginValidator,
    verifyEmailValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} from "../validators/auth.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
| POST /api/auth/register
|--------------------------------------------------------------------------
*/

router.post(
    "/register",
    rateLimitMiddleware,
    validate(registerValidator),
    registerController
);

/*
|--------------------------------------------------------------------------
| Verify Email
|--------------------------------------------------------------------------
| POST /api/auth/verify-email
|--------------------------------------------------------------------------
*/

router.post(
    "/verify-email",
    rateLimitMiddleware,
    validate(verifyEmailValidator),
    verifyEmailController
);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/

router.post(
    "/login",
    rateLimitMiddleware,
    validate(loginValidator),
    loginController
);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
| POST /api/auth/logout
|--------------------------------------------------------------------------
*/

router.post(
    "/logout",
    authMiddleware,
    logoutController
);

/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
| POST /api/auth/refresh-token
|--------------------------------------------------------------------------
*/

router.post(
    "/refresh-token",
    rateLimitMiddleware,
    refreshTokenController
);

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
| GET /api/auth/me
|--------------------------------------------------------------------------
*/

router.get(
    "/me",
    authMiddleware,
    getCurrentUserController
);

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
| POST /api/auth/forgot-password
|--------------------------------------------------------------------------
*/

router.post(
    "/forgot-password",
    rateLimitMiddleware,
    validate(forgotPasswordValidator),
    forgotPasswordController
);

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
| POST /api/auth/reset-password
|--------------------------------------------------------------------------
*/

router.post(
    "/reset-password",
    rateLimitMiddleware,
    validate(resetPasswordValidator),
    resetPasswordController
);

export default router;