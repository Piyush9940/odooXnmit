import {
    uploadDocument,
    getMyDocuments,
    getMyDocumentById,
    deleteMyDocument,
    getEmployeeDocuments,
    getDocumentById,
    uploadEmployeeDocument,
    deleteDocument
} from "../services/document.service.js";

import {
    successResponse
} from "../utils/response.js";

/*
|--------------------------------------------------------------------------
| Upload My Document
|--------------------------------------------------------------------------
| POST /api/documents
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const uploadMyDocumentController = async (
    req,
    res,
    next
) => {
    try {
        if (!req.file) {
            const error = new Error(
                "Document file is required"
            );

            error.statusCode = 400;

            throw error;
        }

        const document =
            await uploadDocument({
                userId:
                    req.user.id,

                file:
                    req.file,

                documentType:
                    req.body.documentType,

                description:
                    req.body.description
            });

        return successResponse(
            res,
            201,
            "Document uploaded successfully",
            document
        );
    } catch (error) {
        next(error);
    }
};

/*
|--------------------------------------------------------------------------
| Get My Documents
|--------------------------------------------------------------------------
| GET /api/documents/me
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyDocumentsController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                documentType,
                page,
                limit
            } = req.query;

            const result =
                await getMyDocuments({
                    userId:
                        req.user.id,

                    documentType,

                    page,

                    limit
                });

            return successResponse(
                res,
                200,
                "Documents fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get My Document By ID
|--------------------------------------------------------------------------
| GET /api/documents/me/:documentId
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const getMyDocumentByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                documentId
            } = req.params;

            const document =
                await getMyDocumentById({
                    userId:
                        req.user.id,

                    documentId
                });

            return successResponse(
                res,
                200,
                "Document fetched successfully",
                document
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Delete My Document
|--------------------------------------------------------------------------
| DELETE /api/documents/me/:documentId
| EMPLOYEE only
|--------------------------------------------------------------------------
*/

const deleteMyDocumentController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                documentId
            } = req.params;

            const result =
                await deleteMyDocument({
                    userId:
                        req.user.id,

                    documentId
                });

            return successResponse(
                res,
                200,
                "Document deleted successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Upload Employee Document
|--------------------------------------------------------------------------
| POST /api/documents/employee/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const uploadEmployeeDocumentController =
    async (
        req,
        res,
        next
    ) => {
        try {
            if (!req.file) {
                const error = new Error(
                    "Document file is required"
                );

                error.statusCode = 400;

                throw error;
            }

            const {
                employeeId
            } = req.params;

            const document =
                await uploadEmployeeDocument({
                    employeeId,

                    uploadedBy:
                        req.user.id,

                    file:
                        req.file,

                    documentType:
                        req.body.documentType,

                    description:
                        req.body.description
                });

            return successResponse(
                res,
                201,
                "Employee document uploaded successfully",
                document
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Employee Documents
|--------------------------------------------------------------------------
| GET /api/documents/employee/:employeeId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getEmployeeDocumentsController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                employeeId
            } = req.params;

            const {
                documentType,
                page,
                limit
            } = req.query;

            const result =
                await getEmployeeDocuments({
                    employeeId,

                    documentType,

                    page,

                    limit
                });

            return successResponse(
                res,
                200,
                "Employee documents fetched successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get Document By ID
|--------------------------------------------------------------------------
| GET /api/documents/:documentId
| ADMIN only
|--------------------------------------------------------------------------
*/

const getDocumentByIdController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                documentId
            } = req.params;

            const document =
                await getDocumentById(
                    documentId
                );

            return successResponse(
                res,
                200,
                "Document fetched successfully",
                document
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Delete Document
|--------------------------------------------------------------------------
| DELETE /api/documents/:documentId
| ADMIN only
|--------------------------------------------------------------------------
*/

const deleteDocumentController =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                documentId
            } = req.params;

            const result =
                await deleteDocument({
                    documentId,

                    deletedBy:
                        req.user.id
                });

            return successResponse(
                res,
                200,
                "Document deleted successfully",
                result
            );
        } catch (error) {
            next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    uploadMyDocumentController,

    getMyDocumentsController,
    getMyDocumentByIdController,

    deleteMyDocumentController,

    uploadEmployeeDocumentController,
    getEmployeeDocumentsController,

    getDocumentByIdController,
    deleteDocumentController
};