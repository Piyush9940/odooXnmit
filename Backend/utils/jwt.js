import jwt from "jsonwebtoken";

const getJwtConfig = () => {
    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error(
            "JWT_SECRET is not defined in environment variables"
        );
    }

    return {
        secret,
        expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES_IN || "1d"
    };
};

const generateToken = (userId) => {
    if (!userId) {
        throw new Error("User ID is required to generate JWT");
    }

    const { secret, expiresIn } = getJwtConfig();

    return jwt.sign(
        {
            userId: userId.toString()
        },
        secret,
        {
            expiresIn
        }
    );
};

const generateAccessToken = (payload) => {
    if (!payload?.userId) {
        throw new Error("User ID is required to generate JWT");
    }

    const { secret, expiresIn } = getJwtConfig();

    return jwt.sign(payload, secret, { expiresIn });
};

const generateRefreshToken = (payload) => {
    if (!payload?.userId) {
        throw new Error("User ID is required to generate refresh token");
    }

    const { secret } = getJwtConfig();

    return jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    });
};

const verifyToken = (token) => {
    if (!token) {
        throw new Error("JWT token is required");
    }

    const { secret } = getJwtConfig();

    return jwt.verify(token, secret);
};

const decodeToken = (token) => {
    if (!token) {
        return null;
    }

    return jwt.decode(token);
};

export {
    generateToken,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    decodeToken
};
