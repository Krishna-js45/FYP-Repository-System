import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import ProjectReview from "@/models/ProjectReview";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// POST /api/project/review — staff approves or rejects a project
export async function POST(request: NextRequest) {
    try {
        const staffId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");
        if (!staffId || role !== "staff") return errorResponse("Forbidden. Staff access only.", 403);

        const body = await request.json();
        const { projectId, action, comment } = body;

        if (!projectId || !action || !comment) {
            return errorResponse("projectId, action, and comment are required", 400);
        }
        if (!["approved", "rejected"].includes(action)) {
            return errorResponse('Action must be "approved" or "rejected"', 400);
        }
        if (comment.trim().length < 10) {
            return errorResponse("Comment must be at least 10 characters", 400);
        }

        await connectDB();

        const project = await Project.findById(projectId);
        if (!project) return errorResponse("Project not found", 404);

        const newStatus = action === "approved" ? "approved" : "rejected";

        // Append to review history
        await ProjectReview.create({
            projectId: project._id,
            studentId: project.studentId,
            reviewedBy: staffId,
            action,
            comment: comment.trim(),
        });

        // Update project status + snpashot latest review
        project.status = newStatus;
        project.latestReviewComment = comment.trim();
        project.latestReviewedBy = staffId as unknown as typeof project.latestReviewedBy;
        project.latestReviewedAt = new Date();
        await project.save();

        return successResponse({ message: "Review submitted", newStatus }, 201);
    } catch (err) {
        console.error("[PROJECT REVIEW]", err);
        return errorResponse("Internal server error", 500);
    }
}
