"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEPARTMENTS } from "@/types";

const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition";
const inputStyle: React.CSSProperties = {
    border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)"
};

// MCE register number: exactly 12 digits starting with 6215
// Format: 6215 (college) + 2 (batch yr) + 3 (dept code) + 3 (roll)
const REGNO_REGEX = /^6215\d{8}$/;

export default function StudentRegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        registerNumber: "", name: "", department: "", batch: "", section: "", phone: "", password: "",
    });
    const [regnoError, setRegnoError] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));

        // Live validate register number
        if (name === "registerNumber") {
            const v = value.trim();
            if (v.length === 0) { setRegnoError(""); return; }
            if (!/^\d*$/.test(v)) { setRegnoError("Only digits allowed"); return; }
            if (!v.startsWith("6215")) { setRegnoError("Must start with 6215 (MCE college code)"); return; }
            if (v.length !== 12) { setRegnoError(`Must be exactly 12 digits (${v.length}/12)`); return; }
            setRegnoError("");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        // Final validation before sending
        if (!REGNO_REGEX.test(form.registerNumber.trim())) {
            setError("Invalid register number format. Must be 12 digits starting with 6215.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "student", ...form }),
            });
            const data = await res.json();
            if (!data.success) { setError(data.error); return; }
            setSuccess(true);
            setTimeout(() => router.push("/login?role=student"), 1500);
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <p className="font-bold text-lg" style={{ color: "var(--mce-blue)" }}>Account Created!</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Redirecting to login…</p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-5">
                <h2 className="text-lg font-extrabold" style={{ color: "var(--mce-blue)" }}>Student Registration</h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Create your MCE FYP Portal account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Register Number — special with live validation */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--text-muted)" }}>
                        Register Number
                        <span className="ml-2 normal-case font-normal text-xs" style={{ color: "var(--text-muted)" }}>
                            (12 digits starting with 6215)
                        </span>
                    </label>
                    <input
                        name="registerNumber" type="text" required maxLength={12}
                        value={form.registerNumber}
                        onChange={handleChange}
                        placeholder="e.g. 621523205001"
                        className={inputCls}
                        style={{
                            ...inputStyle,
                            borderColor: regnoError ? "var(--danger)" : "var(--border)",
                            fontFamily: "monospace", letterSpacing: "0.08em",
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = regnoError ? "var(--danger)" : "var(--mce-blue)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = regnoError ? "var(--danger)" : "var(--border)"}
                    />
                    {regnoError && (
                        <p className="text-xs mt-1 font-medium" style={{ color: "var(--danger)" }}>⚠️ {regnoError}</p>
                    )}
                    {!regnoError && form.registerNumber.length === 12 && (
                        <p className="text-xs mt-1 font-medium" style={{ color: "var(--success)" }}>✓ Valid register number</p>
                    )}
                </div>

                {/* Rest of fields */}
                {[
                    { name: "name", label: "Full Name", placeholder: "Your full name", type: "text" },
                    { name: "batch", label: "Batch Year", placeholder: "e.g. 2022-2026", type: "text" },
                    { name: "section", label: "Section", placeholder: "e.g. A", type: "text" },
                    { name: "phone", label: "Phone Number", placeholder: "e.g. 9876543210", type: "tel" },
                    { name: "password", label: "Password", placeholder: "Min. 8 characters", type: "password" },
                ].map((f) => (
                    <div key={f.name}>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                            style={{ color: "var(--text-muted)" }}>{f.label}</label>
                        <input name={f.name} type={f.type} required
                            value={form[f.name as keyof typeof form]} onChange={handleChange}
                            placeholder={f.placeholder} className={inputCls} style={inputStyle}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--mce-blue)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                    </div>
                ))}

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--text-muted)" }}>Department</label>
                    <select name="department" required value={form.department} onChange={handleChange}
                        className={inputCls} style={inputStyle}>
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {error && (
                    <div className="text-sm px-4 py-3 rounded-xl"
                        style={{ background: "#FEE2E2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                        ⚠️ {error}
                    </div>
                )}

                <button type="submit" disabled={loading || !!regnoError}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "var(--mce-blue)", boxShadow: "0 4px 15px rgba(14,165,233,0.4)" }}>
                    {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                        : "Create Account →"}
                </button>
            </form>

            <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link href="/login" className="font-bold hover:underline" style={{ color: "var(--mce-blue)" }}>Sign in</Link>
            </p>
        </>
    );
}
