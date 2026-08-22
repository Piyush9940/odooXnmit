import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/*
|--------------------------------------------------------------------------
| Upload Buffer to Cloudinary
|--------------------------------------------------------------------------
|
| Used when multer stores the uploaded file in memory.
|
*/

const uploadBuffer = (
    buffer,
    {
        folder,
        publicId = undefined,
        resourceType = "auto"
    } = {}
) => {
    return new Promise((resolve, reject) => {
        if (!buffer) {
            return reject(
                new Error("File buffer is required")
            );
        }

        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: publicId,
                    resource_type: resourceType
                },
                (error, result) => {
                    if (error) {
                        return reject(
                            new Error(
                                `Cloudinary upload failed: ${error.message}`
                            )
                        );
                    }

                    if (!result) {
                        return reject(
                            new Error(
                                "Cloudinary returned an empty response"
                            )
                        );
                    }

                    resolve(result);
                }
            );

        streamifier
            .createReadStream(buffer)
            .pipe(uploadStream);
    });
};

/*
|--------------------------------------------------------------------------
| Upload Profile Picture
|--------------------------------------------------------------------------
*/

const uploadProfilePicture = async (
    buffer,
    employeeId
) => {
    if (!employeeId) {
        throw new Error(
            "Employee ID is required"
        );
    }

    return uploadBuffer(buffer, {
        folder: `dayflow/profiles/${employeeId}`,
        resourceType: "image"
    });
};

/*
|--------------------------------------------------------------------------
| Upload Employee Document
|--------------------------------------------------------------------------
*/

const uploadDocument = async (
    buffer,
    employeeId,
    documentType
) => {
    if (!employeeId) {
        throw new Error(
            "Employee ID is required"
        );
    }

    if (!documentType) {
        throw new Error(
            "Document type is required"
        );
    }

    return uploadBuffer(buffer, {
        folder: `dayflow/documents/${employeeId}/${documentType}`,
        resourceType: "auto"
    });
};

/*
|--------------------------------------------------------------------------
| Upload Salary Slip
|--------------------------------------------------------------------------
*/

const uploadSalarySlip = async (
    buffer,
    employeeId,
    payrollYear,
    payrollMonth
) => {
    if (!employeeId) {
        throw new Error(
            "Employee ID is required"
        );
    }

    if (!payrollYear || !payrollMonth) {
        throw new Error(
            "Payroll year and month are required"
        );
    }

    return uploadBuffer(buffer, {
        folder: `dayflow/salary-slips/${employeeId}/${payrollYear}/${payrollMonth}`,
        resourceType: "raw"
    });
};

/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

const deleteFile = async (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) {
        throw new Error(
            "Cloudinary public ID is required"
        );
    }

    try {
        const result =
            await cloudinary.uploader.destroy(
                publicId,
                {
                    resource_type: resourceType
                }
            );

        if (
            result.result !== "ok" &&
            result.result !== "not found"
        ) {
            throw new Error(
                `Cloudinary deletion failed: ${result.result}`
            );
        }

        return result;
    } catch (error) {
        throw new Error(
            `Failed to delete Cloudinary file: ${error.message}`
        );
    }
};

/*
|--------------------------------------------------------------------------
| Delete Raw File
|--------------------------------------------------------------------------
*/

const deleteRawFile = async (
    publicId
) => {
    return deleteFile(
        publicId,
        "raw"
    );
};

/*
|--------------------------------------------------------------------------
| Delete Image
|--------------------------------------------------------------------------
*/

const deleteImage = async (
    publicId
) => {
    return deleteFile(
        publicId,
        "image"
    );
};

/*
|--------------------------------------------------------------------------
| Get File Details
|--------------------------------------------------------------------------
*/

const getFileDetails = async (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) {
        throw new Error(
            "Cloudinary public ID is required"
        );
    }

    try {
        const result =
            await cloudinary.api.resource(
                publicId,
                {
                    resource_type: resourceType
                }
            );

        return result;
    } catch (error) {
        throw new Error(
            `Failed to retrieve Cloudinary file: ${error.message}`
        );
    }
};

/*
|--------------------------------------------------------------------------
| Generate Secure URL
|--------------------------------------------------------------------------
*/

const getSecureUrl = (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) {
        throw new Error(
            "Cloudinary public ID is required"
        );
    }

    return cloudinary.url(
        publicId,
        {
            secure: true,
            resource_type: resourceType
        }
    );
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export {
    uploadBuffer,
    uploadProfilePicture,
    uploadDocument,
    uploadSalarySlip,
    deleteFile,
    deleteRawFile,
    deleteImage,
    getFileDetails,
    getSecureUrl
};