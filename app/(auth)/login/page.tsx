"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type Role = "student" | "staff";

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [role, setRole] = useState<Role>((params.get("role") as Role) ?? "student");
    const [identifier, setId] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Keep URL in sync when toggling role
    useEffect(() => { setId(""); setError(""); }, [role]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, identifier: identifier.trim(), password }),
            });
            const data = await res.json();
            if (!data.success) { setError(data.error || "Invalid credentials"); return; }
            // Role-based redirect
            router.push(data.user.role === "staff" ? "/dashboard/staff" : "/dashboard/student");
            router.refresh();
        } catch { setError("Network error. Check your connection."); }
        finally { setLoading(false); }
    }

    return (
        <>
            {/* Role toggle */}
            <div className="flex rounded-2xl p-1 mb-6"
                style={{ background: "var(--navy-light)" }}>
                {(["student", "staff"] as Role[]).map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={role === r
                            ? { background: "var(--navy)", color: "#fff", boxShadow: "0 2px 8px rgba(30,58,95,0.3)" }
                            : { color: "var(--text-muted)" }}>
                        {r === "student" ? "🎓 Student" : "👩‍🏫 Staff"}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--text-muted)" }}>
                        {role === "student" ? "Register Number" : "Email Address"}
                    </label>
                    <input
                        type={role === "student" ? "text" : "email"}
                        value={identifier}
                        onChange={(e) => setId(e.target.value)}
                        placeholder={role === "student" ? "e.g. 621523205002" : "you@mahendra.edu.in"}
                        required
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2"
                        style={{
                            border: "1.5px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text)",
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--text-muted)" }}>Password</label>
                    <div className="relative">
                        <input
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition pr-12"
                            style={{ border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                            {showPass ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                        style={{ background: "#FEE2E2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                    style={{ background: loading ? "var(--navy-mid)" : "var(--navy)", boxShadow: "0 4px 15px rgba(30,58,95,0.4)" }}>
                    {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                        : "Sign In →"}
                </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
                No account?{" "}
                <Link href={`/register/${role}`}
                    className="font-bold hover:underline"
                    style={{ color: "var(--navy)" }}>
                    Register as {role}
                </Link>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
