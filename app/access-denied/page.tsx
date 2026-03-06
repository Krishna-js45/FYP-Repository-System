"use client";
import Link from "next/link";

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ background: "var(--bg)" }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg"
                style={{ background: "#FEE2E2" }}>
                🚫
            </div>
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--mce-black)" }}>Access Denied</h1>
            <p className="text-sm leading-relaxed max-w-xs mb-8" style={{ color: "var(--text-muted)" }}>
                This page is only accessible to MCE faculty staff. Students cannot view other students&apos; profiles.
            </p>
            <Link href="/dashboard/student"
                className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition active:scale-95"
                style={{ background: "var(--mce-blue)", boxShadow: "0 4px 15px rgba(14,165,233,0.35)" }}>
                ← Back to My Dashboard
            </Link>
        </div>
    );
}
