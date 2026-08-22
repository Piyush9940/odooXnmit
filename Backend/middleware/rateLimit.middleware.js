import rateLimit from "express-rate-limit";

const createRateLimiter = ({
    windowMs,
    max,
    message
}) => {
    return rateLimit({
        windowMs,
        limit: max,
        standardHeaders: "draft-8",
        legacyHeaders: false,

        handler: (req, res) => {
            return res.status(429).json({
                success: false,
                message,
                data: null,
                error: "Too many requests. Please try again later."
            });
        }
    });
};

/*
 * General API rate limiter
 *
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests. Please try again later."
});

/*
 * Login rate limiter
 *
 * 10 login attempts per 15 minutes per IP
 */
export const loginRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again later."
});

/*
 * Registration rate limiter
 *
 * 5 registration attempts per hour per IP
 */
export const registerRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts. Please try again later."
});

/*
 * Email verification rate limiter
 *
 * 5 attempts per 15 minutes per IP
 */
export const verificationRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many verification attempts. Please try again later."
});

/*
 * Password reset rate limiter
 *
 * 5 attempts per 15 minutes per IP
 */
export const passwordResetRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many password reset requests. Please try again later."
});

/*
 * Admin notification rate limiter
 *
 * 30 requests per 15 minutes per IP
 */
export const adminNotificationRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many notification requests. Please try again later."
});