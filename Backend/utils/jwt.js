import jwt from "jsonwebtoken";

const getJwtConfig = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is not defined in environment variables"
        );
    }

    return {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
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
    verifyToken,
    decodeToken
};