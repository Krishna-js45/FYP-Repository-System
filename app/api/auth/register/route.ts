import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";

// MCE register number format: 6215 + 2 batch digits + 3 dept digits + 3 roll digits = 12 digits
const REGNO_REGEX = /^6215\d{8}$/;

export async function POST(request: NextRequest) {
    try {
        const connectDB = (await import("@/lib/db")).default;
        const User = (await import("@/models/User")).default;
        const { hashPassword } = await import("@/lib/hashPassword");

        const body = await request.json();
        const { role, password } = body;

        console.log("[REGISTER] body received:", { ...body, password: "***", accessCode: "***" });

        if (!["student", "staff"].includes(role)) {
            return errorResponse("Invalid role", 400);
        }
        if (!password || password.length < 8) {
            return errorResponse("Password must be at least 8 characters", 400);
        }

        // ── Check env ──
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes("<username>")) {
            console.error("[REGISTER] MONGODB_URI is missing or still a placeholder");
            return errorResponse(
                "Server is not connected to a database yet. Please contact the admin.",
                503
            );
        }

        await connectDB();
        console.log("[REGISTER] DB connected ✓");

        const passwordHash = await hashPassword(password);

        // ════════════════════════════════════════════
        // STUDENT registration
        // ════════════════════════════════════════════
        if (role === "student") {
            const { registerNumber, name, department, batch, section, phone } = body;

            // Validate register number format
            const normalised = (registerNumber ?? "").trim();
            if (!REGNO_REGEX.test(normalised)) {
                return errorResponse(
                    "Invalid register number format. Must be exactly 12 digits starting with 6215 (e.g. 621523205001).",
                    400
                );
            }

            if (!name || !department || !batch || !section || !phone) {
                return errorResponse("All student fields are required", 400);
            }

            const exists = await User.findOne({ registerNumber: normalised });
            if (exists) return errorResponse("Register number already exists", 409);

            await User.create({
                role: "student",
                registerNumber: normalised,
                name: name.trim(),
                department,
                batch: batch.trim(),
                section: section.toUpperCase().trim(),
                phone: phone.trim(),
                passwordHash,
            });

            console.log("[REGISTER] Student created:", normalised);

            // ════════════════════════════════════════════
            // STAFF registration
            // ════════════════════════════════════════════
        } else {
            const { email, staffName, designation, staffDepartment, accessCode } = body;

            // Validate staff access code
            const correctCode = process.env.STAFF_ACCESS_CODE;
            if (!correctCode) {
                console.error("[REGISTER] STAFF_ACCESS_CODE not set in .env.local");
                return errorResponse("Staff registration is currently disabled. Contact admin.", 503);
            }
            if (!accessCode || accessCode.trim() !== correctCode) {
                return errorResponse("Invalid staff access code. Contact the MCE admin office.", 403);
            }

            if (!email || !staffName || !designation || !staffDepartment) {
                return errorResponse("All staff fields are required", 400);
            }

            const exists = await User.findOne({ email: email.toLowerCase() });
            if (exists) return errorResponse("Email already registered", 409);

            await User.create({
                role: "staff",
                email: email.toLowerCase().trim(),
                staffName: staffName.trim(),
                designation: designation.trim(),
                staffDepartment,
                passwordHash,
            });

            console.log("[REGISTER] Staff created:", email);
        }

        return successResponse({ message: "Account created successfully" }, 201);

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[REGISTER] ERROR:", msg);

        if (msg.includes("ECONNREFUSED") || msg.includes("ETIMEDOUT") || msg.includes("querySrv")) {
            return errorResponse("Cannot connect to database. Check MONGODB_URI in .env.local", 503);
        }
        if (msg.includes("E11000") || msg.includes("duplicate key")) {
            return errorResponse("An account with this register number or email already exists", 409);
        }
        if (msg.includes("Please define MONGODB_URI") || msg.includes("placeholder values")) {
            return errorResponse("Database not configured. Add MONGODB_URI to .env.local", 503);
        }

        return errorResponse(`Registration failed: ${msg}`, 500);
    }
}
