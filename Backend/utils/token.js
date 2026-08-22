import crypto from "crypto";

/**
 * Generates a cryptographically secure random token.
 *
 * The raw token is returned to the caller and should be
 * sent to the user through email.
 */
const generateToken = (bytes = 32) => {
    if (!Number.isInteger(bytes) || bytes < 16) {
        throw new Error(
            "Token size must be an integer of at least 16 bytes"
        );
    }

    return crypto.randomBytes(bytes).toString("hex");
};

/**
 * Creates a SHA-256 hash of a token.
 *
 * Only the hashed token should be stored in MongoDB.
 */
const hashToken = (token) => {
    if (!token || typeof token !== "string") {
        throw new Error("Token is required for hashing");
    }

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

/**
 * Generates a token and its hash.
 *
 * Useful when creating email verification
 * or password reset tokens.
 */
const generateTokenPair = (bytes = 32) => {
    const token = generateToken(bytes);
    const tokenHash = hashToken(token);

    return {
        token,
        tokenHash
    };
};

export {
    generateToken,
    hashToken,
    generateTokenPair
};