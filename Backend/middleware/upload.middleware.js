import multer from "multer";

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => {
    return (req, file, cb) => {
        try {
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(
                    new Error(
                        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
                    ),
                    false
                );
            }

            cb(null, true);
        } catch (error) {
            cb(error, false);
        }
    };
};

const createUpload = (allowedTypes) => {
    return multer({
        storage,
        limits: {
            fileSize: MAX_FILE_SIZE
        },
        fileFilter: fileFilter(allowedTypes)
    });
};

export const uploadProfile = createUpload(
    ALLOWED_IMAGE_TYPES
);

export const uploadDocument = createUpload(
    ALLOWED_DOCUMENT_TYPES
);

export const uploadSalarySlip = createUpload(
    ["application/pdf"]
);

export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds the allowed limit",
                data: null,
                error: `Maximum file size is ${
                    MAX_FILE_SIZE / (1024 * 1024)
                } MB`
            });
        }

        return res.status(400).json({
            success: false,
            message: "File upload failed",
            data: null,
            error: error.message
        });
    }

    if (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid file",
            data: null,
            error: error.message
        });
    }

    next();
};

export default uploadDocument;
