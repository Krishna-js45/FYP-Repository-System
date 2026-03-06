import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "acadvault_token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET as string);
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface JWTPayloadCustom extends JWTPayload {
    sub: string;   // userId
    role: "student" | "staff";
}

// ── Sign JWT ──────────────────────────────────────────────────────────────────
export async function signJWT(payload: { sub: string; role: "student" | "staff" }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
}

// ── Verify JWT ────────────────────────────────────────────────────────────────
export async function verifyJWT(token: string): Promise<JWTPayloadCustom | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as JWTPayloadCustom;
    } catch {
        return null;
    }
}

// ── Set cookie (server-side, after login) ─────────────────────────────────────
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
}

// ── Clear cookie (logout) ─────────────────────────────────────────────────────
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// ── Get and verify current user from cookie ───────────────────────────────────
export async function getCurrentUser(): Promise<JWTPayloadCustom | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
}

export { COOKIE_NAME };
