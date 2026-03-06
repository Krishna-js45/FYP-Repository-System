import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// GET /api/student/profile — student fetches their own profile
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!userId || role !== "student") return errorResponse("Unauthorized", 403);

        await connectDB();
        const user = await User.findById(userId).select(
            "registerNumber name department batch section phone avatarUrl"
        );
        if (!user) return errorResponse("Student not found", 404);

        return successResponse({ profile: user.toObject() });
    } catch (err) {
        console.error("[STUDENT PROFILE GET]", err);
        return errorResponse("Internal server error", 500);
    }
}

// PATCH /api/student/profile — student updates their own profile
export async function PATCH(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!userId || role !== "student") return errorResponse("Unauthorized", 403);

        const body = await request.json();
        const ALLOWED_FIELDS = ["name", "department", "batch", "section", "phone", "avatarUrl"];

        // Whitelist — students cannot change registerNumber or role
        const updates: Record<string, string> = {};
        for (const field of ALLOWED_FIELDS) {
            if (body[field] !== undefined) updates[field] = body[field];
        }

        await connectDB();
        await User.findByIdAndUpdate(userId, { $set: updates }, { runValidators: true });

        return successResponse({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("[STUDENT PROFILE PATCH]", err);
        return errorResponse("Internal server error", 500);
    }
}
