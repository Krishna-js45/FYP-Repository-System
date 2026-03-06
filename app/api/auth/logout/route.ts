import { clearAuthCookie } from "@/lib/auth";
import { successResponse } from "@/lib/apiResponse";

export async function POST() {
    await clearAuthCookie();
    return successResponse({ message: "Logged out successfully" });
}
