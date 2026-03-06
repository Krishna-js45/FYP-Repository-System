import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const COOKIE_NAME = "acadvault_token";

// Public paths — no auth needed
const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths (and all sub-paths of /register)
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { sub: userId, role } = payload as { sub: string; role: string };

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-user-role", role);

        // ── Role-based route guards ─────────────────────────────
        // /dashboard/student — students only → staff go to /dashboard/staff
        if (pathname.startsWith("/dashboard/student") && role !== "student") {
            return NextResponse.redirect(new URL("/dashboard/staff", request.url));
        }
        // /dashboard/staff — staff only → students go to /dashboard/student
        if (pathname.startsWith("/dashboard/staff") && role !== "staff") {
            return NextResponse.redirect(new URL("/dashboard/student", request.url));
        }
        // /student/[regno] — staff only → students get access denied
        if (pathname.startsWith("/student/") && role !== "staff") {
            return NextResponse.redirect(new URL("/access-denied", request.url));
        }

        return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete(COOKIE_NAME);
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|college-logo.png|mahendra-logo.png).*)"],
};
