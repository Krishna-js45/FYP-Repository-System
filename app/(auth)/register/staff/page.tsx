"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEPARTMENTS } from "@/types";

const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition";
const inputStyle: React.CSSProperties = {
    border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)"
};

export default function StaffRegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: "", staffName: "", designation: "", staffDepartment: "", password: "", accessCode: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "staff", ...form }),
            });
            const data = await res.json();
            if (!data.success) { setError(data.error); return; }
            setSuccess(true);
            setTimeout(() => router.push("/login?role=staff"), 1500);
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
                <h2 className="text-lg font-extrabold" style={{ color: "var(--mce-blue)" }}>Staff Registration</h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Staff Registration — MCE FYP Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
                {[
                    { name: "email", label: "College Email", placeholder: "you@mahendra.edu.in", type: "email" },
                    { name: "staffName", label: "Full Name", placeholder: "Dr. / Prof. Name", type: "text" },
                    { name: "designation", label: "Designation", placeholder: "Associate Professor", type: "text" },
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
                    <select name="staffDepartment" required value={form.staffDepartment} onChange={handleChange}
                        className={inputCls} style={inputStyle}>
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Staff Access Code — secret field */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--text-muted)" }}>
                        Staff Access Code
                        <span className="ml-2 normal-case font-normal" style={{ color: "var(--text-muted)" }}>
                            (provided by admin)
                        </span>
                    </label>
                    <input name="accessCode" type="password" required
                        value={form.accessCode} onChange={handleChange}
                        placeholder="Enter staff access code"
                        className={inputCls} style={inputStyle}
                        onFocus={(e) => e.currentTarget.style.borderColor = "var(--mce-blue)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        🔒 Contact MCE admin office for the access code
                    </p>
                </div>

                {error && (
                    <div className="text-sm px-4 py-3 rounded-xl"
                        style={{ background: "#FEE2E2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                        ⚠️ {error}
                    </div>
                )}

                <button type="submit" disabled={loading}
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
