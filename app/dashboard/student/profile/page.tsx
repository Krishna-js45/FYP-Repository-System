"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEPARTMENTS } from "@/types";

const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition";

export default function StudentProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", department: "", batch: "", section: "", phone: "" });
    const [success, setSuccess] = useState(false);

    function startEdit() {
        setForm({
            name: user?.name ?? "",
            department: user?.department ?? "",
            batch: "",
            section: "",
            phone: "",
        });
        setEditing(true);
    }

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/student/profile", {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) { setSuccess(true); setEditing(false); router.refresh(); }
        } finally { setSaving(false); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 rounded-full animate-spin"
                    style={{ borderColor: "var(--navy-light)", borderTopColor: "var(--navy)" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-up space-y-4">
            <div className="pt-1">
                <h1 className="text-xl font-extrabold" style={{ color: "var(--navy)" }}>My Profile</h1>
            </div>

            {/* Avatar card */}
            <div className="rounded-3xl p-6 text-white text-center shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-mid))" }}>
                <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-extrabold"
                    style={{ background: "var(--gold)" }}>
                    {(user?.name ?? "S")[0].toUpperCase()}
                </div>
                <p className="text-lg font-extrabold">{user?.name}</p>
                <p className="text-sm opacity-70 mt-0.5">{user?.registerNumber}</p>
                <span className="inline-block mt-3 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(245,166,35,0.2)", color: "var(--gold)" }}>
                    🎓 Student
                </span>
            </div>

            {/* Info card */}
            {!editing && (
                <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                    {[
                        { label: "Register Number", value: user?.registerNumber ?? "—" },
                        { label: "Department", value: user?.department ?? "—" },
                    ].map((row) => (
                        <div key={row.label} className="flex justify-between py-3 border-b last:border-0"
                            style={{ borderColor: "var(--border)" }}>
                            <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{row.label}</span>
                            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{row.value}</span>
                        </div>
                    ))}
                    <button onClick={startEdit}
                        className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition"
                        style={{ background: "var(--navy-light)", color: "var(--navy)" }}>
                        ✏️ Edit Profile
                    </button>
                </div>
            )}

            {editing && (
                <form onSubmit={saveProfile} className="rounded-2xl p-4 shadow-sm space-y-4"
                    style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                    {[
                        { name: "name", label: "Full Name", placeholder: "Your full name", type: "text" },
                        { name: "batch", label: "Batch Year", placeholder: "e.g. 2022-2026", type: "text" },
                        { name: "section", label: "Section", placeholder: "e.g. A", type: "text" },
                        { name: "phone", label: "Phone", placeholder: "10-digit number", type: "tel" },
                    ].map((f) => (
                        <div key={f.name}>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                style={{ color: "var(--text-muted)" }}>{f.label}</label>
                            <input type={f.type} value={form[f.name as keyof typeof form]}
                                onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                                placeholder={f.placeholder} className={inputCls}
                                style={{ border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                                onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                                onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                        </div>
                    ))}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                            style={{ color: "var(--text-muted)" }}>Department</label>
                        <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                            className={inputCls} style={{ border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}>
                            <option value="">Select department</option>
                            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setEditing(false)}
                            className="flex-1 py-3 rounded-xl font-bold text-sm border-2"
                            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition"
                            style={{ background: "var(--navy)" }}>
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            {success && (
                <div className="text-sm px-4 py-3 rounded-xl text-center font-semibold"
                    style={{ background: "#DCFCE7", color: "var(--success)" }}>
                    ✅ Profile updated successfully!
                </div>
            )}
        </div>
    );
}
