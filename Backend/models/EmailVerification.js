import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            unique: true,
            index: true
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            index: true
        },

        tokenHash: {
            type: String,
            required: [true, "Verification token is required"],
            unique: true,
            index: true
        },

        expiresAt: {
            type: Date,
            required: [true, "Token expiry is required"],
            index: true
        },

        verifiedAt: {
            type: Date,
            default: null
        },

        attempts: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

/*
 * Automatically delete the verification document
 * when expiresAt is reached.
 *
 * MongoDB TTL index.
 */
emailVerificationSchema.index(
    {
        expiresAt: 1
    },
    {
        expireAfterSeconds: 0
    }
);

emailVerificationSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.tokenHash;

        return ret;
    }
});

const EmailVerification = mongoose.model(
    "EmailVerification",
    emailVerificationSchema
);

export default EmailVerification;