import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadToCloudinary(
    fileBuffer: Buffer,
    folder: string,
    publicIdPrefix: string
): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: `acadvault/${folder}`,
                    public_id: `${publicIdPrefix}_${Date.now()}`,
                    resource_type: "raw", // needed for PDFs and PPTs
                },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error("Upload failed"));
                    resolve({ url: result.secure_url, publicId: result.public_id });
                }
            )
            .end(fileBuffer);
    });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
}

export default cloudinary;
