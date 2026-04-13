import multer from "multer";

export const multerUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
    fileFilter: (req, file, cb) => {
        // Additional file validation
        const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
        if (allowedMimes.includes(file.mimetype)) {
            console.log(`✅ File validation passed: ${file.originalname} (${file.mimetype})`);
            cb(null, true);
        } else {
            console.error(`❌ Invalid MIME type: ${file.mimetype}`);
            cb(new Error(`Invalid MIME type: ${file.mimetype}`));
        }
    }
});