import multer from 'multer';
import cloudinary from '../config/cloudinary';

// Store file in memory (as a buffer) so we can stream it to Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Reusable function to upload a single file to Cloudinary
export const uploadToCloudinary = async (
    file: Express.Multer.File
): Promise<{ public_id: string; url: string }> => {
    // Convert the buffer to a base64 data URI
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;


    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'trailpin_destinations',
    });

    return {
        public_id: result.public_id,
        url: result.secure_url,
    };
};

export default upload;