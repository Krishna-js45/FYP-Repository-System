import { NextRequest } from "next/server";
import {
    uploadToCloudinary,
    deleteFromCloudinary,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
} from "@/lib/cloudinary";
import Project from "@/models/Project";
import connectDB from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";

type DocType = "proposal" | "report" | "presentation";

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");
        if (!userId || role !== "student") return errorResponse("Unauthorized", 403);

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const docType = formData.get("docType") as DocType | null;

        if (!file) return errorResponse("No file provided", 400);
        if (!docType || !["proposal", "report", "presentation"].includes(docType)) {
            return errorResponse("Invalid docType. Must be proposal, report, or presentation", 400);
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return errorResponse("Invalid file type. Only PDF, PPT, and PPTX are allowed.", 400);
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return errorResponse("File too large. Maximum allowed size is 10MB.", 400);
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await connectDB();

        // Find student's existing project to get old publicId for replacement
        const project = await Project.findOne({ studentId: userId });

        // Safely read old publicId using explicit field names
        let oldPublicId = "";
        if (project) {
            if (docType === "proposal") oldPublicId = project.proposalPublicId;
            if (docType === "report") oldPublicId = project.reportPublicId;
            if (docType === "presentation") oldPublicId = project.presentationPublicId;
        }

        // Upload new file first
        const { url, publicId } = await uploadToCloudinary(
            fileBuffer,
            docType,
            `${userId}_${docType}`
        );

        // Delete old file only after successful upload
        if (oldPublicId) {
            await deleteFromCloudinary(oldPublicId);
        }

        // Update project document if it exists using explicit field names
        if (project) {
            if (docType === "proposal") {
                project.proposalUrl = url;
                project.proposalPublicId = publicId;
            } else if (docType === "report") {
                project.reportUrl = url;
                project.reportPublicId = publicId;
            } else {
                project.presentationUrl = url;
                project.presentationPublicId = publicId;
            }
            await project.save();
        }

        return successResponse({ url, publicId });
    } catch (err) {
        console.error("[UPLOAD]", err);
        return errorResponse("File upload failed. Please try again.", 500);
    }
}
