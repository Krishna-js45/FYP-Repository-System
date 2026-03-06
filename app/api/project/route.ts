import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/project — student fetches their own project
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");
        if (!userId || role !== "student") return errorResponse("Unauthorized", 403);

        await connectDB();
        const project = await Project.findOne({ studentId: userId }).lean();

        return successResponse({ project: project ?? null });
    } catch (err) {
        console.error("[PROJECT GET]", err);
        return errorResponse("Internal server error", 500);
    }
}

// POST /api/project — student creates a new project
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");
        if (!userId || role !== "student") return errorResponse("Unauthorized", 403);

        const body = await request.json();
        const { title, abstract, techStack, guideName, teamMembers, submitAsDraft } = body;

        if (!title?.trim() || !abstract?.trim() || !guideName?.trim()) {
            return errorResponse("Title, abstract, and guide name are required", 400);
        }

        await connectDB();

        // Prevent duplicate project at API level (DB unique constraint is the safety net)
        const existing = await Project.findOne({ studentId: userId });
        if (existing) {
            return errorResponse("Project already exists. Use PATCH to update.", 409);
        }

        const status = submitAsDraft ? "draft" : "submitted";

        const project = await Project.create({
            studentId: userId,
            title: title.trim(),
            abstract: abstract.trim(),
            techStack: Array.isArray(techStack) ? techStack : [],
            guideName: guideName.trim(),
            teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
            status,
        });

        return successResponse({ projectId: project._id.toString(), status }, 201);
    } catch (err: unknown) {
        // MongoDB duplicate key error
        if ((err as { code?: number }).code === 11000) {
            return errorResponse("Project already exists. Use PATCH to update.", 409);
        }
        console.error("[PROJECT POST]", err);
        return errorResponse("Internal server error", 500);
    }
}
