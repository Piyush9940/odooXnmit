import Document from "../models/Document.js";
import Employee from "../models/Employee.js";

import {
    uploadDocument as uploadToCloudinary,
    deleteFile
} from "./cloudinary.service.js";

const getPagination = ({ page = 1, limit = 10 } = {}) => {
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
        Math.max(Number.parseInt(limit, 10) || 10, 1),
        100
    );

    return {
        page: pageNumber,
        limit: limitNumber,
        skip: (pageNumber - 1) * limitNumber
    };
};

const findEmployeeByUserId = async (userId) => {
    const employee = await Employee.findOne({ user: userId, isActive: true });

    if (!employee) {
        throw new Error("Employee profile not found");
    }

    return employee;
};

const uploadForEmployee = async ({ employee, uploadedBy, file, documentType, description }) => {
    if (!file?.buffer) {
        throw new Error("Document file is required");
    }

    const cloudinaryFile = await uploadToCloudinary(
        file.buffer,
        employee.employeeId,
        documentType
    );

    try {
        const document = await Document.create({
            employee: employee._id,
            employeeId: employee.employeeId,
            documentType,
            title: file.originalname,
            originalName: file.originalname,
            fileName: cloudinaryFile.public_id,
            fileType: file.mimetype,
            mimeType: file.mimetype,
            fileSize: file.size,
            cloudinary: {
                url: cloudinaryFile.secure_url,
                publicId: cloudinaryFile.public_id,
                resourceType: cloudinaryFile.resource_type || "raw",
                format: cloudinaryFile.format || ""
            },
            uploadedBy,
            remarks: description || ""
        });

        employee.documents.push(document._id);
        await employee.save();

        return document;
    } catch (error) {
        try {
            await deleteFile(
                cloudinaryFile.public_id,
                cloudinaryFile.resource_type || "raw"
            );
        } catch (cleanupError) {
            console.error("Failed to clean up uploaded document:", cleanupError.message);
        }

        throw error;
    }
};

const listDocuments = async ({ employeeId, documentType, page, limit }) => {
    const { page: currentPage, limit: currentLimit, skip } = getPagination({ page, limit });
    const filter = { employee: employeeId, isActive: true };

    if (documentType) {
        filter.documentType = documentType;
    }

    const [documents, total] = await Promise.all([
        Document.find(filter).sort({ createdAt: -1 }).skip(skip).limit(currentLimit),
        Document.countDocuments(filter)
    ]);

    return {
        documents,
        pagination: {
            total,
            page: currentPage,
            limit: currentLimit,
            totalPages: Math.ceil(total / currentLimit)
        }
    };
};

const uploadDocument = async ({ userId, file, documentType, description }) => {
    const employee = await findEmployeeByUserId(userId);
    return uploadForEmployee({ employee, uploadedBy: userId, file, documentType, description });
};

const getMyDocuments = async ({ userId, documentType, page, limit }) => {
    const employee = await findEmployeeByUserId(userId);
    return listDocuments({ employeeId: employee._id, documentType, page, limit });
};

const getMyDocumentById = async ({ userId, documentId }) => {
    const employee = await findEmployeeByUserId(userId);
    const document = await Document.findOne({
        _id: documentId,
        employee: employee._id,
        isActive: true
    });

    if (!document) {
        throw new Error("Document not found");
    }

    return document;
};

const deleteStoredDocument = async ({ document, employee }) => {
    await deleteFile(document.cloudinary.publicId, document.cloudinary.resourceType);
    await Document.deleteOne({ _id: document._id });

    if (employee) {
        employee.documents.pull(document._id);
        await employee.save();
    }

    return { message: "Document deleted successfully" };
};

const deleteMyDocument = async ({ userId, documentId }) => {
    const employee = await findEmployeeByUserId(userId);
    const document = await getMyDocumentById({ userId, documentId });
    return deleteStoredDocument({ document, employee });
};

const uploadEmployeeDocument = async ({ employeeId, uploadedBy, file, documentType, description }) => {
    const employee = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase(), isActive: true });

    if (!employee) {
        throw new Error("Employee not found");
    }

    return uploadForEmployee({ employee, uploadedBy, file, documentType, description });
};

const getEmployeeDocuments = async ({ employeeId, documentType, page, limit }) => {
    const employee = await Employee.findOne({ employeeId: employeeId.trim().toUpperCase(), isActive: true });

    if (!employee) {
        throw new Error("Employee not found");
    }

    return listDocuments({ employeeId: employee._id, documentType, page, limit });
};

const getDocumentById = async (documentId) => {
    const document = await Document.findOne({ _id: documentId, isActive: true });

    if (!document) {
        throw new Error("Document not found");
    }

    return document;
};

const deleteDocument = async ({ documentId }) => {
    const document = await getDocumentById(documentId);
    const employee = await Employee.findById(document.employee);
    return deleteStoredDocument({ document, employee });
};

export {
    uploadDocument,
    getMyDocuments,
    getMyDocumentById,
    deleteMyDocument,
    getEmployeeDocuments,
    getDocumentById,
    uploadEmployeeDocument,
    deleteDocument
};
