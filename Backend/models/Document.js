import mongoose from "mongoose";

import { DOCUMENT_TYPES } from "../utils/constants.js";

const documentSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee is required"],
            index: true
        },

        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            trim: true,
            uppercase: true,
            index: true
        },

        documentType: {
            type: String,
            enum: {
                values: [
                    DOCUMENT_TYPES.OFFER_LETTER,
                    DOCUMENT_TYPES.EXPERIENCE_LETTER,
                    DOCUMENT_TYPES.ID_PROOF,
                    DOCUMENT_TYPES.CERTIFICATE,
                    DOCUMENT_TYPES.OTHER
                ],
                message: "Invalid document type"
            },
            required: [true, "Document type is required"],
            index: true
        },

        title: {
            type: String,
            required: [true, "Document title is required"],
            trim: true,
            maxlength: 200
        },

        originalName: {
            type: String,
            required: [true, "Original file name is required"],
            trim: true
        },

        fileName: {
            type: String,
            required: [true, "File name is required"],
            trim: true
        },

        fileType: {
            type: String,
            required: [true, "File type is required"],
            trim: true
        },

        mimeType: {
            type: String,
            required: [true, "MIME type is required"],
            trim: true
        },

        fileSize: {
            type: Number,
            required: [true, "File size is required"],
            min: 0
        },

        cloudinary: {
            url: {
                type: String,
                required: [true, "Cloudinary URL is required"],
                trim: true
            },

            publicId: {
                type: String,
                required: [true, "Cloudinary public ID is required"],
                trim: true,
                index: true
            },

            resourceType: {
                type: String,
                default: "raw",
                trim: true
            },

            format: {
                type: String,
                default: "",
                trim: true
            }
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader is required"]
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

/*
 * Useful for employee document listing.
 */
documentSchema.index({
    employee: 1,
    documentType: 1,
    createdAt: -1
});

/*
 * Useful for Cloudinary file lookup/deletion.
 */
documentSchema.index({
    "cloudinary.publicId": 1
});

documentSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;

        return ret;
    }
});

const Document = mongoose.model(
    "Document",
    documentSchema
);

export default Document;