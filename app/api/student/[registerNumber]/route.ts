import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import ProjectReview from "@/models/ProjectReview";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/student/:registerNumber — staff views any student's full profile + project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ registerNumber: string }> }
) {
    try {
        const role = request.headers.get("x-user-role");
        if (role !== "staff") return errorResponse("Forbidden. Staff access only.", 403);

        const { registerNumber } = await params;

        await connectDB();

        const student = await User.findOne({
            registerNumber: registerNumber.toUpperCase(),
            role: "student",
        }).select("-passwordHash");

        if (!student) return errorResponse("Student not found", 404);

        const project = await Project.findOne({ studentId: student._id }).lean();

        let reviewHistory: object[] = [];
        if (project) {
            const reviews = await ProjectReview.find({ projectId: project._id })
                .sort({ reviewedAt: -1 })
                .populate("reviewedBy", "staffName designation")
                .lean();

            reviewHistory = reviews.map((r) => ({
                action: r.action,
                comment: r.comment,
                reviewedByName: (r.reviewedBy as { staffName?: string })?.staffName ?? "Staff",
                reviewedAt: r.reviewedAt,
            }));
        }

        return successResponse({
            student: {
                id: student._id.toString(),
                registerNumber: student.registerNumber,
                name: student.name,
                department: student.department,
                batch: student.batch,
                section: student.section,
                avatarUrl: student.avatarUrl,
                project: project ?? null,
                reviewHistory,
            },
        });
    } catch (err) {
        console.error("[STUDENT LOOKUP]", err);
        return errorResponse("Internal server error", 500);
    }
}
