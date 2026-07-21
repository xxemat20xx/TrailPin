import multer from 'multer';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';

// Multer memory storage – file will be in req.file.buffer
const storage = multer.memoryStorage();

// File filter – accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Helper to upload buffer to Cloudinary
export const uploadToCloudinary = (file: Express.Multer.File): Promise<{ url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'trailpin_destinations', // optional folder in Cloudinary
                resource_type: 'image',
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error('Upload failed'));
                } else {
                    resolve({ url: result.secure_url, public_id: result.public_id });
                }
            }
        );
        // Write the buffer to the stream
        uploadStream.end(file.buffer);
    });
};