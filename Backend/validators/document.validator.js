import Joi from "joi";

import {
    DOCUMENT_TYPES
} from "../utils/constants.js";

/*
|--------------------------------------------------------------------------
| Common Fields
|--------------------------------------------------------------------------
*/

const employeeId = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^EMP\d{3,}$/)
    .required()
    .messages({
        "string.empty": "Employee ID is required",
        "string.pattern.base":
            "Employee ID must follow the format EMP001",
        "any.required":
            "Employee ID is required"
    });

const optionalEmployeeId = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^EMP\d{3,}$/)
    .messages({
        "string.pattern.base":
            "Employee ID must follow the format EMP001"
    });

/*
|--------------------------------------------------------------------------
| Document Type
|--------------------------------------------------------------------------
*/

const documentType = Joi.string()
    .valid(
        DOCUMENT_TYPES.OFFER_LETTER,
        DOCUMENT_TYPES.EXPERIENCE_LETTER,
        DOCUMENT_TYPES.ID_PROOF,
        DOCUMENT_TYPES.CERTIFICATE,
        DOCUMENT_TYPES.OTHER
    )
    .required()
    .messages({
        "any.only":
            "Invalid document type",
        "any.required":
            "Document type is required"
    });

/*
|--------------------------------------------------------------------------
| Upload Document
|--------------------------------------------------------------------------
|
| Used when uploading a document.
|
| The actual file is NOT validated here.
| File validation is handled by:
|
| upload.middleware.js
|
*/

const uploadDocumentSchema = Joi.object({
    employeeId,

    documentType,

    title: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required()
        .messages({
            "string.empty":
                "Document title is required",
            "string.min":
                "Document title must be at least 2 characters",
            "string.max":
                "Document title cannot exceed 200 characters",
            "any.required":
                "Document title is required"
        }),

    remarks: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Employee Upload Own Document
|--------------------------------------------------------------------------
|
| Employee does not send employeeId.
| Backend gets the employee from req.user.
|
*/

const uploadOwnDocumentSchema = Joi.object({
    documentType,

    title: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required()
        .messages({
            "string.empty":
                "Document title is required",
            "string.min":
                "Document title must be at least 2 characters",
            "string.max":
                "Document title cannot exceed 200 characters",
            "any.required":
                "Document title is required"
        }),

    remarks: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .default("")
});

/*
|--------------------------------------------------------------------------
| Update Document
|--------------------------------------------------------------------------
|
| File replacement should be handled through a
| separate upload endpoint.
|
*/

const updateDocumentSchema = Joi.object({
    documentType: Joi.string()
        .valid(
            DOCUMENT_TYPES.OFFER_LETTER,
            DOCUMENT_TYPES.EXPERIENCE_LETTER,
            DOCUMENT_TYPES.ID_PROOF,
            DOCUMENT_TYPES.CERTIFICATE,
            DOCUMENT_TYPES.OTHER
        ),

    title: Joi.string()
        .trim()
        .min(2)
        .max(200),

    remarks: Joi.string()
        .trim()
        .max(500)
        .allow(""),

    isActive: Joi.boolean()
}).min(1);

/*
|--------------------------------------------------------------------------
| Document Query
|--------------------------------------------------------------------------
|
| Used by Admin to filter employee documents.
|
*/

const documentQuerySchema = Joi.object({
    employeeId: optionalEmployeeId,

    documentType: Joi.string()
        .valid(
            DOCUMENT_TYPES.OFFER_LETTER,
            DOCUMENT_TYPES.EXPERIENCE_LETTER,
            DOCUMENT_TYPES.ID_PROOF,
            DOCUMENT_TYPES.CERTIFICATE,
            DOCUMENT_TYPES.OTHER
        ),

    isActive: Joi.boolean(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
});

/*
|--------------------------------------------------------------------------
| Document ID Params
|--------------------------------------------------------------------------
*/

const documentIdParamSchema = Joi.object({
    documentId: Joi.string()
        .trim()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex":
                "Invalid document ID",
            "string.length":
                "Invalid document ID",
            "any.required":
                "Document ID is required"
        })
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    uploadDocumentSchema,
    uploadDocumentSchema as uploadDocumentValidator,
    uploadOwnDocumentSchema,
    updateDocumentSchema,
    documentQuerySchema,
    documentQuerySchema as documentQueryValidator,
    documentIdParamSchema
};
