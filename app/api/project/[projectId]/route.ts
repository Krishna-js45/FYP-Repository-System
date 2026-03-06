import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { successResponse, errorResponse } from "@/lib/apiResponse";

const EDITABLE_STATUSES = ["draft", "rejected"];

// PATCH /api/project/:projectId — student edits existing project
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");
        if (!userId || role !== "student") return errorResponse("Unauthorized", 403);

        const { projectId } = await params;
        const body = await request.json();

        await connectDB();

        const project = await Project.findOne({ _id: projectId, studentId: userId });

        if (!project) return errorResponse("Project not found", 404);

        if (!EDITABLE_STATUSES.includes(project.status)) {
            return errorResponse(
                "Project cannot be edited while it is submitted, under review, or approved",
                403
            );
        }

        const { title, abstract, techStack, guideName, teamMembers, submitAsDraft } = body;

        if (title) project.title = title.trim();
        if (abstract) project.abstract = abstract.trim();
        if (guideName) project.guideName = guideName.trim();
        if (Array.isArray(techStack)) project.techStack = techStack;
        if (Array.isArray(teamMembers)) project.teamMembers = teamMembers;

        // If explicitly submitting (not saving as draft), update status
        if (submitAsDraft === false) {
            project.status = "submitted";
        }

        await project.save();

        return successResponse({ message: "Project updated", status: project.status });
    } catch (err) {
        console.error("[PROJECT PATCH]", err);
        return errorResponse("Internal server error", 500);
    }
}
