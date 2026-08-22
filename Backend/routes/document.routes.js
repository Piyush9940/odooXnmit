import express from "express";

import {
    uploadMyDocumentController,
    getMyDocumentsController,
    getMyDocumentByIdController,
    deleteMyDocumentController,
    uploadEmployeeDocumentController,
    getEmployeeDocumentsController,
    getDocumentByIdController,
    deleteDocumentController
} from "../controllers/document.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import validate from "../middleware/validation.middleware.js";
import uploadMiddleware from "../middleware/upload.middleware.js";

import {
    uploadDocumentValidator,
    documentQueryValidator
} from "../validators/document.validator.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| EMPLOYEE DOCUMENT ROUTES
|--------------------------------------------------------------------------
*/

/*
| POST /api/documents
| Employee uploads their own document
|
| Content-Type: multipart/form-data
| Field: document
*/

router.post(
    "/",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    uploadMiddleware.single("document"),
    validate(uploadDocumentValidator),
    uploadMyDocumentController
);

/*
| GET /api/documents/me
| Employee views their own documents
*/

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    validate(documentQueryValidator),
    getMyDocumentsController
);

/*
| GET /api/documents/me/:documentId
| Employee views one of their documents
*/

router.get(
    "/me/:documentId",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    getMyDocumentByIdController
);

/*
| DELETE /api/documents/me/:documentId
| Employee deletes their own document
*/

router.delete(
    "/me/:documentId",
    authMiddleware,
    roleMiddleware("EMPLOYEE"),
    deleteMyDocumentController
);

/*
|--------------------------------------------------------------------------
| ADMIN DOCUMENT ROUTES
|--------------------------------------------------------------------------
*/

/*
| POST /api/documents/employee/:employeeId
| Admin uploads a document for an employee
|
| Content-Type: multipart/form-data
| Field: document
*/

router.post(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    uploadMiddleware.single("document"),
    validate(uploadDocumentValidator),
    uploadEmployeeDocumentController
);

/*
| GET /api/documents/employee/:employeeId
| Admin views all documents of an employee
*/

router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(documentQueryValidator),
    getEmployeeDocumentsController
);

/*
| GET /api/documents/:documentId
| Admin views a specific document
*/

router.get(
    "/:documentId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getDocumentByIdController
);

/*
| DELETE /api/documents/:documentId
| Admin deletes a document
*/

router.delete(
    "/:documentId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteDocumentController
);

export default router;
