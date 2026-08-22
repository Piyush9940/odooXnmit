import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 */
const hashPassword = async (password) => {
    try {
        if (!password || typeof password !== "string") {
            throw new Error(
                "Password is required and must be a string"
            );
        }

        if (password.length < 8) {
            throw new Error(
                "Password must be at least 8 characters long"
            );
        }

        return await bcrypt.hash(
            password,
            SALT_ROUNDS
        );
    } catch (error) {
        throw new Error(
            `Password hashing failed: ${error.message}`
        );
    }
};

/**
 * Compare a plain-text password with a hashed password.
 */
const comparePassword = async (
    plainPassword,
    hashedPassword
) => {
    try {
        if (!plainPassword || !hashedPassword) {
            throw new Error(
                "Both password and hashed password are required"
            );
        }

        return await bcrypt.compare(
            plainPassword,
            hashedPassword
        );
    } catch (error) {
        throw new Error(
            `Password comparison failed: ${error.message}`
        );
    }
};

export {
    hashPassword,
    comparePassword
};