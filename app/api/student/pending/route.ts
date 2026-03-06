import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
    try {
        const role = request.headers.get("x-user-role");
        if (role !== "staff") return errorResponse("Staff only", 403);

        const connectDB = (await import("@/lib/db")).default;
        const User = (await import("@/models/User")).default;
        const Project = (await import("@/models/Project")).default;

        await connectDB();

        // Aggregate stats from project collection
        const totalStudents = await User.countDocuments({ role: "student" });
        const pending = await Project.countDocuments({ status: { $in: ["submitted", "under_review"] } });
        const approved = await Project.countDocuments({ status: "approved" });
        const rejected = await Project.countDocuments({ status: "rejected" });

        // Fetch submitted/under_review projects — join with User via studentId
        const pendingProjects = await Project.aggregate([
            { $match: { status: { $in: ["submitted", "under_review"] } } },
            { $sort: { updatedAt: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: "users",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student",
                },
            },
            { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    status: 1,
                    updatedAt: 1,
                    "student.name": 1,
                    "student.registerNumber": 1,
                },
            },
        ]);

        const pending_list = pendingProjects.map((p: {
            _id: unknown;
            title?: string;
            status?: string;
            updatedAt?: Date;
            student?: { name?: string; registerNumber?: string };
        }) => ({
            _id: String(p._id),
            registerNumber: p.student?.registerNumber ?? "",
            studentName: p.student?.name ?? "Unknown",
            title: p.title ?? "Untitled",
            status: p.status ?? "submitted",
            submittedAt: p.updatedAt?.toISOString() ?? "",
        }));

        return successResponse({
            pending: pending_list,
            stats: { total: totalStudents, pending, approved, rejected },
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[PENDING] ERROR:", msg);
        return errorResponse("Failed to load pending list", 500);
    }
}
