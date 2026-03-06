import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword } from "@/lib/hashPassword";
import { signJWT, setAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { role, identifier, password } = body;

        if (!role || !identifier || !password) {
            return errorResponse("Role, identifier, and password are required", 400);
        }

        await connectDB();

        const query =
            role === "student"
                ? { registerNumber: identifier.toUpperCase().trim() }
                : { email: identifier.toLowerCase().trim() };

        const user = await User.findOne({ ...query, role });
        if (!user) return errorResponse("Invalid credentials", 401);

        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) return errorResponse("Invalid credentials", 401);

        const token = await signJWT({
            sub: user._id.toString(),
            role: user.role,
        });

        await setAuthCookie(token);

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
        console.error("[LOGIN]", err);
        return errorResponse("Internal server error", 500);
    }
}
