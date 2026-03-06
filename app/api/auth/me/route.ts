import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        const role = request.headers.get("x-user-role");

        if (!userId || !role) return errorResponse("Unauthorized", 401);

        await connectDB();
        const user = await User.findById(userId).select("-passwordHash");
        if (!user) return errorResponse("User not found", 404);

        return successResponse({
            user: {
                id: user._id.toString(),
                role: user.role,
                name: user.role === "student" ? user.name : user.staffName,
                registerNumber: user.registerNumber ?? null,
                email: user.email ?? null,
                department: user.department ?? user.staffDepartment ?? null,
                avatarUrl: user.avatarUrl ?? null,
            },
        });
    } catch (err) {
        console.error("[ME]", err);
        return errorResponse("Internal server error", 500);
    }
}
