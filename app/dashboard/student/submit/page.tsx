"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { ITeamMemberClient } from "@/types";

const STEP_LABELS = ["Project Info", "Team & Tech", "Review & Submit"];

const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition";
const inputStyle: React.CSSProperties = {
    border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)"
};

export default function ProjectSubmitPage() {
    const router = useRouter();
    const { project, loading } = useProject();

    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /* ── Form state ─────────────────────────────────── */
    const [title, setTitle] = useState("");
    const [abstract, setAbstract] = useState("");
    const [guideName, setGuide] = useState("");
    const [teamMembers, setTeam] = useState<ITeamMemberClient[]>([{ name: "", registerNumber: "" }]);
    const [techStack, setTech] = useState<string[]>([]);
    const [techInput, setTechInput] = useState("");

    // Pre-fill if editing
    useEffect(() => {
        if (project && (project.status === "draft" || project.status === "rejected")) {
            setTitle(project.title ?? "");
            setAbstract(project.abstract ?? "");
            setGuide(project.guideName ?? "");
            setTeam(project.teamMembers?.length ? project.teamMembers : [{ name: "", registerNumber: "" }]);
            setTech(project.techStack ?? []);
        }
    }, [project]);

    // ── Team helpers ──
    function addMember() {
        if (teamMembers.length < 6) setTeam([...teamMembers, { name: "", registerNumber: "" }]);
    }
    function removeMember(i: number) {
        setTeam(teamMembers.filter((_, idx) => idx !== i));
    }
    function updateMember(i: number, field: "name" | "registerNumber", val: string) {
        setTeam(teamMembers.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
    }

    // ── Tech tag helpers ──
    function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
        if ((e.key === "Enter" || e.key === ",") && techInput.trim()) {
            e.preventDefault();
            if (!techStack.includes(techInput.trim()) && techStack.length < 15)
                setTech([...techStack, techInput.trim()]);
            setTechInput("");
        }
    }
    function removeTag(tag: string) { setTech(techStack.filter((t) => t !== tag)); }

    // ── Submit ────────────────────────────────────────
    async function handleSave(asDraft: boolean) {
        setError("");
        setSaving(true);
        try {
            const body = { title, abstract, guideName, teamMembers, techStack, submitAsDraft: asDraft };
            const isEdit = !!project;
            const url = isEdit ? `/api/project/${project._id}` : "/api/project";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!data.success) { setError(data.error); return; }
            router.push("/dashboard/student");
        } catch { setError("Network error. Please try again."); }
        finally { setSaving(false); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 rounded-full animate-spin"
                    style={{ borderColor: "var(--navy-light)", borderTopColor: "var(--navy)" }} />
            </div>
        );
    }

    const isEdit = !!project;
    const canEdit = !isEdit || project.status === "draft" || project.status === "rejected";

    if (!canEdit) {
        return (
            <div className="py-12 text-center">
                <div className="text-5xl mb-4">🔒</div>
                <p className="font-bold" style={{ color: "var(--navy)" }}>Project is under review</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>You cannot edit while it's being reviewed.</p>
                <button onClick={() => router.push("/dashboard/student")}
                    className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "var(--navy)" }}>← Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-up">

            {/* ── Header ────────────────────────────────── */}
            <div className="flex items-center gap-3 pt-1 mb-5">
                <button onClick={() => step === 0 ? router.back() : setStep(step - 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                    ←
                </button>
                <div>
                    <h1 className="font-extrabold text-lg" style={{ color: "var(--navy)" }}>
                        {isEdit ? "Edit Project" : "Submit Project"}
                    </h1>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
                    </p>
                </div>
            </div>

            {/* ── Step progress ──────────────────────────── */}
            <div className="flex items-center gap-2 mb-6">
                {STEP_LABELS.map((_, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all"
                            style={i < step
                                ? { background: "var(--navy)", borderColor: "var(--navy)", color: "#fff" }
                                : i === step
                                    ? { background: "var(--gold)", borderColor: "var(--gold)", color: "#fff" }
                                    : { background: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                            {i < step ? "✓" : i + 1}
                        </div>
                        {i < STEP_LABELS.length - 1 && (
                            <div className="flex-1 h-0.5 rounded-full transition-all"
                                style={{ background: i < step ? "var(--navy)" : "var(--border)" }} />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Step 0: Project Info ───────────────────── */}
            {step === 0 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Project Title *
                        </label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AI-Powered Student Attendance System"
                            className={inputCls} style={{ ...inputStyle, maxLength: 200 } as React.CSSProperties}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Abstract * <span className="ml-2 text-xs normal-case font-normal">({abstract.length}/2000)</span>
                        </label>
                        <textarea value={abstract} onChange={(e) => setAbstract(e.target.value.slice(0, 2000))}
                            placeholder="Briefly describe your project goals, methodology, and expected outcomes…"
                            rows={5} className={`${inputCls} resize-none`}
                            style={inputStyle}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Guide / Supervisor Name *
                        </label>
                        <input value={guideName} onChange={(e) => setGuide(e.target.value)} placeholder="e.g. Dr. A. Rajan"
                            className={inputCls} style={inputStyle}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                    </div>

                    <button
                        onClick={() => { if (!title.trim() || !abstract.trim() || !guideName.trim()) { setError("All fields in this step are required."); return; } setError(""); setStep(1); }}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95"
                        style={{ background: "var(--navy)", boxShadow: "0 4px 15px rgba(30,58,95,0.35)" }}>
                        Next: Team Info →
                    </button>
                </div>
            )}

            {/* ── Step 1: Team & Tech ───────────────────── */}
            {step === 1 && (
                <div className="space-y-5">
                    {/* Team members */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                                Team Members
                            </label>
                            {teamMembers.length < 6 && (
                                <button onClick={addMember} className="text-xs font-semibold px-3 py-1 rounded-lg"
                                    style={{ background: "var(--navy-light)", color: "var(--navy)" }}>
                                    + Add
                                </button>
                            )}
                        </div>
                        <div className="space-y-2.5">
                            {teamMembers.map((m, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-1.5">
                                        <input value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)}
                                            placeholder="Full name" className={`${inputCls} py-2.5`} style={inputStyle}
                                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                                        <input value={m.registerNumber} onChange={(e) => updateMember(i, "registerNumber", e.target.value.toUpperCase())}
                                            placeholder="Reg. No e.g. 22CS001" className={`${inputCls} py-2.5`} style={inputStyle}
                                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                                    </div>
                                    {teamMembers.length > 1 && (
                                        <button onClick={() => removeMember(i)}
                                            className="mt-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                            style={{ background: "#FEE2E2", color: "var(--danger)" }}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech stack */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                            Tech Stack <span className="normal-case font-normal">(press Enter to add)</span>
                        </label>
                        <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={addTag}
                            placeholder="e.g. React, Node.js, MongoDB…"
                            className={inputCls} style={inputStyle}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                        {techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                                {techStack.map((t) => (
                                    <span key={t} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: "var(--navy-light)", color: "var(--navy)" }}>
                                        {t}
                                        <button onClick={() => removeTag(t)} className="ml-1 text-xs hover:text-red-500">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setStep(0)}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm border-2 transition"
                            style={{ borderColor: "var(--navy)", color: "var(--navy)" }}>
                            ← Back
                        </button>
                        <button onClick={() => { setError(""); setStep(2); }}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95"
                            style={{ background: "var(--navy)" }}>
                            Next: Review →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Review & Submit ───────────────── */}
            {step === 2 && (
                <div className="space-y-4">
                    {/* Summary */}
                    {[
                        { label: "Title", value: title },
                        { label: "Guide", value: guideName },
                        { label: "Tech", value: techStack.join(", ") || "—" },
                        { label: "Members", value: teamMembers.filter(m => m.name).map(m => `${m.name} (${m.registerNumber})`).join(", ") || "—" },
                    ].map((row) => (
                        <div key={row.label} className="rounded-2xl p-4"
                            style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                                {row.label}
                            </p>
                            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text)" }}>{row.value}</p>
                        </div>
                    ))}
                    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Abstract</p>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{abstract.slice(0, 200)}{abstract.length > 200 ? "…" : ""}</p>
                    </div>

                    {error && (
                        <div className="text-sm px-4 py-3 rounded-xl"
                            style={{ background: "#FEE2E2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={() => handleSave(true)} disabled={saving}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm border-2 transition disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ borderColor: "var(--navy)", color: "var(--navy)" }}>
                            {saving ? <span className="w-4 h-4 border-2 border-navy-200 border-t-navy rounded-full animate-spin" /> : "Save Draft"}
                        </button>
                        <button onClick={() => handleSave(false)} disabled={saving}
                            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: "var(--navy)", boxShadow: "0 4px 15px rgba(30,58,95,0.35)" }}>
                            {saving
                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                                : "Submit for Review ✓"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
