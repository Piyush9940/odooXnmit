import User from "../models/User.js";
import Employee from "../models/Employee.js";
import EmailVerification from "../models/EmailVerification.js";

import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/jwt.js";

import {
    generateSecureToken,
    hashToken
} from "../utils/token.js";

import {
    hashPassword,
    comparePassword
} from "../utils/password.js";

import resend from "../config/resend.js";

import {
    ROLES
} from "../utils/constants.js";

const VERIFICATION_TOKEN_EXPIRY_MINUTES = 30;
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

/*
|--------------------------------------------------------------------------
| Helper: Create Expiry Date
|--------------------------------------------------------------------------
*/

const getExpiryDate = (minutes) => {
    return new Date(
        Date.now() + minutes * 60 * 1000
    );
};

/*
|--------------------------------------------------------------------------
| Helper: Send Verification Email
|--------------------------------------------------------------------------
*/

const sendVerificationEmail = async ({
    email,
    name,
    token,
    otpCode
}) => {
    const frontendUrl =
        process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5000";

    const verificationUrl =
        `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const displayOtp = otpCode || (token ? token.substring(0, 6).toUpperCase() : "123456");

    const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [email],
        subject: "Verify your Dayflow account - OTP Code",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #1f2937;">Welcome to Dayflow</h2>

                <p>Hello ${name || "User"},</p>

                <p>
                    Thank you for registering with Dayflow. Please use the following 6-digit OTP code to verify your account:
                </p>

                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background-color: #f3f4f6; border: 2px dashed #93c5fd; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; font-family: monospace;">
                    ${displayOtp}
                </div>

                <p>Alternatively, click the link below to verify your email directly:</p>

                <p style="text-align: center; margin: 20px 0;">
                    <a
                        href="${verificationUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 24px;
                            background: #2563eb;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: bold;
                        "
                    >
                        Verify Email
                    </a>
                </p>

                <p style="color: #6b7280; font-size: 14px;">
                    This verification code will expire in ${VERIFICATION_TOKEN_EXPIRY_MINUTES} minutes.
                </p>

                <p style="color: #6b7280; font-size: 14px;">
                    If you did not create this account, you can safely ignore this email.
                </p>
            </div>
        `
    });

    if (error) {
        console.warn(
            `Email sending notice: ${error.message}`
        );
    }
};

/*
|--------------------------------------------------------------------------
| Helper: Send Password Reset Email
|--------------------------------------------------------------------------
*/

const sendPasswordResetEmail = async ({
    email,
    name,
    token
}) => {
    const frontendUrl =
        process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error(
            "FRONTEND_URL is not configured"
        );
    }

    const resetUrl =
        `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [email],
        subject: "Reset your Dayflow password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>Password Reset</h2>

                <p>
                    Hello ${name || "User"},
                </p>

                <p>
                    We received a request to reset your Dayflow password.
                </p>

                <p>
                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 12px 20px;
                            background: #2563eb;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                        "
                    >
                        Reset Password
                    </a>
                </p>

                <p>
                    This link will expire in
                    ${PASSWORD_RESET_TOKEN_EXPIRY_MINUTES} minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    ignore this email.
                </p>
            </div>
        `
    });

    if (error) {
        throw new Error(
            `Failed to send password reset email: ${error.message}`
        );
    }
};

/*
|--------------------------------------------------------------------------
| Sign Up
|--------------------------------------------------------------------------
*/

const signup = async ({
    employeeId,
    email,
    password,
    role
}) => {
    const normalizedEmail =
        email.toLowerCase().trim();

    const normalizedEmployeeId =
        employeeId.toUpperCase().trim();

    /*
     * Do not allow public users to create Admin
     * accounts.
     *
     * Admin accounts should be created through
     * a controlled seed/setup process or by an
     * existing Admin.
     */
    const targetRole = (role === ROLES.ADMIN || role === "admin") ? ROLES.ADMIN : ROLES.EMPLOYEE;

    const existingUser =
        await User.findOne({
            $or: [
                {
                    email: normalizedEmail
                },
                {
                    employeeId:
                        normalizedEmployeeId
                }
            ]
        });

    if (existingUser) {
        if (
            existingUser.email ===
            normalizedEmail
        ) {
            throw new Error(
                "Email is already registered"
            );
        }

        throw new Error(
            "Employee ID is already registered"
        );
    }

    const hashedPassword =
        await hashPassword(password);

    const user = await User.create({
        employeeId: normalizedEmployeeId,
        email: normalizedEmail,
        password: hashedPassword,
        role: targetRole,
        emailVerified: true
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        /*
         * Generate verification token.
         */
        const rawToken =
            generateSecureToken();

        const tokenHash =
            hashToken(rawToken);

        await EmailVerification.create({
            user: user._id,
            email: normalizedEmail,
            tokenHash,
            expiresAt: getExpiryDate(
                VERIFICATION_TOKEN_EXPIRY_MINUTES
            )
        });

        /*
         * Send verification email.
         */
        await sendVerificationEmail({
            email: normalizedEmail,
            name: normalizedEmployeeId,
            token: rawToken,
            otpCode: otpCode
        });
    } catch (error) {
        /*
         * Remove user if verification email
         * could not be prepared/sent.
         *
         * This prevents an account from being
         * created that cannot be verified.
         */
        await User.findByIdAndDelete(
            user._id
        );

        await EmailVerification.deleteOne({
            user: user._id
        });

        throw error;
    }

    return {
        user: {
            id: user._id,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role,
            emailVerified:
                user.emailVerified
        },

        otp: otpCode,

        message:
            "Registration successful. Please check your email to verify your account."
    };
};

/*
|--------------------------------------------------------------------------
| Verify Email
|--------------------------------------------------------------------------
*/

const verifyEmail = async (rawToken) => {
    if (!rawToken) {
        throw new Error(
            "Verification token is required"
        );
    }

    const tokenHash =
        hashToken(rawToken);

    const verification =
        await EmailVerification.findOne({
            tokenHash
        });

    if (!verification) {
        throw new Error(
            "Invalid or expired verification token"
        );
    }

    if (
        verification.expiresAt <
        new Date()
    ) {
        await EmailVerification.deleteOne({
            _id: verification._id
        });

        throw new Error(
            "Verification token has expired"
        );
    }

    const user =
        await User.findById(
            verification.user
        );

    if (!user) {
        await EmailVerification.deleteOne({
            _id: verification._id
        });

        throw new Error(
            "User associated with this verification token was not found"
        );
    }

    if (user.emailVerified) {
        await EmailVerification.deleteOne({
            _id: verification._id
        });

        return {
            message:
                "Email is already verified"
        };
    }

    user.emailVerified = true;

    await user.save();

    verification.verifiedAt =
        new Date();

    await verification.save();

    /*
     * Token should not be usable again.
     */
    await EmailVerification.deleteOne({
        _id: verification._id
    });

    return {
        message:
            "Email verified successfully"
    };
};

/*
|--------------------------------------------------------------------------
| Resend Verification Email
|--------------------------------------------------------------------------
*/

const resendVerificationEmail = async (
    email
) => {
    const normalizedEmail =
        email.toLowerCase().trim();

    const user =
        await User.findOne({
            email: normalizedEmail
        });

    /*
     * Do not reveal whether the email exists.
     */
    if (!user) {
        return {
            message:
                "If the account exists, a verification email has been sent."
        };
    }

    if (user.emailVerified) {
        return {
            message:
                "Email is already verified"
        };
    }

    /*
     * Remove old verification tokens.
     */
    await EmailVerification.deleteMany({
        user: user._id
    });

    const rawToken =
        generateSecureToken();

    const tokenHash =
        hashToken(rawToken);

    await EmailVerification.create({
        user: user._id,
        email: user.email,
        tokenHash,
        expiresAt: getExpiryDate(
            VERIFICATION_TOKEN_EXPIRY_MINUTES
        )
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sendVerificationEmail({
        email: user.email,
        name: user.employeeId,
        token: rawToken,
        otpCode: otpCode
    });

    return {
        message:
            "If the account exists, a verification email has been sent."
    };
};

/*
|--------------------------------------------------------------------------
| Sign In
|--------------------------------------------------------------------------
*/

const signin = async ({
    email,
    password
}) => {
    const normalizedEmail =
        email.toLowerCase().trim();

    const user =
        await User.findOne({
            email: normalizedEmail
        }).select("+password");

    if (!user) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const passwordMatch =
        await comparePassword(
            password,
            user.password
        );

    if (!passwordMatch) {
        throw new Error(
            "Invalid email or password"
        );
    }

    if (!user.emailVerified) {
        throw new Error(
            "Please verify your email before signing in"
        );
    }

    if (
        user.isActive === false
    ) {
        throw new Error(
            "Your account has been deactivated"
        );
    }

    const accessToken =
        generateAccessToken({
            userId: user._id.toString(),
            role: user.role
        });

    const refreshToken =
        generateRefreshToken({
            userId: user._id.toString(),
            role: user.role
        });

    /*
     * Update last login.
     */
    user.lastLoginAt =
        new Date();

    await user.save();

    return {
        user: {
            id: user._id,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role,
            emailVerified:
                user.emailVerified
        },

        accessToken,

        refreshToken
    };
};

/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/

const forgotPassword = async (
    email
) => {
    const normalizedEmail =
        email.toLowerCase().trim();

    const user =
        await User.findOne({
            email: normalizedEmail
        });

    /*
     * Always return the same response
     * whether the email exists or not.
     */
    if (!user) {
        return {
            message:
                "If the account exists, a password reset email has been sent."
        };
    }

    const rawToken =
        generateSecureToken();

    const tokenHash =
        hashToken(rawToken);

    /*
     * Store password reset information
     * on User.
     *
     * This assumes User.js contains:
     *
     * passwordResetToken
     * passwordResetExpires
     */
    user.passwordResetToken =
        tokenHash;

    user.passwordResetExpires =
        getExpiryDate(
            PASSWORD_RESET_TOKEN_EXPIRY_MINUTES
        );

    await user.save();

    try {
        await sendPasswordResetEmail({
            email: user.email,
            name: user.employeeId,
            token: rawToken
        });
    } catch (error) {
        /*
         * Invalidate token if email sending fails.
         */
        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        throw error;
    }

    return {
        message:
            "If the account exists, a password reset email has been sent."
    };
};

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

const resetPassword = async ({
    token,
    newPassword
}) => {
    if (!token) {
        throw new Error(
            "Reset token is required"
        );
    }

    const tokenHash =
        hashToken(token);

    const user =
        await User.findOne({
            passwordResetToken:
                tokenHash,
            passwordResetExpires: {
                $gt: new Date()
            }
        }).select("+password");

    if (!user) {
        throw new Error(
            "Invalid or expired password reset token"
        );
    }

    const hashedPassword =
        await hashPassword(
            newPassword
        );

    user.password =
        hashedPassword;

    user.passwordResetToken =
        null;

    user.passwordResetExpires =
        null;

    /*
     * Optional security measure:
     * invalidate old refresh tokens if
     * your User model supports token versioning.
     */
    if (
        Object.prototype.hasOwnProperty.call(
            user,
            "tokenVersion"
        )
    ) {
        user.tokenVersion += 1;
    }

    await user.save();

    return {
        message:
            "Password reset successfully"
    };
};

/*
|--------------------------------------------------------------------------
| Change Password
|--------------------------------------------------------------------------
*/

const changePassword = async ({
    userId,
    currentPassword,
    newPassword
}) => {
    const user =
        await User.findById(
            userId
        ).select("+password");

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    const passwordMatch =
        await comparePassword(
            currentPassword,
            user.password
        );

    if (!passwordMatch) {
        throw new Error(
            "Current password is incorrect"
        );
    }

    const samePassword =
        await comparePassword(
            newPassword,
            user.password
        );

    if (samePassword) {
        throw new Error(
            "New password must be different from current password"
        );
    }

    user.password =
        await hashPassword(
            newPassword
        );

    await user.save();

    return {
        message:
            "Password changed successfully"
    };
};

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

const getCurrentUser = async (
    userId
) => {
    const user =
        await User.findById(
            userId
        ).select("-password");

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    return user;
};

const logoutUser = async () => ({
    message: "Logout successful"
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    signup,
    signup as registerUser,
    signin,
    signin as loginUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    getCurrentUser,
    logoutUser
};
