"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IStudentDetailClient, STATUS_LABELS } from "@/types";

export default function StudentProfileStaffView() {
    const { regno } = useParams<{ regno: string }>();
    const router = useRouter();
    const [data, setData] = useState<IStudentDetailClient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Review form state
    const [action, setAction] = useState<"approved" | "rejected" | "">("");
    const [comment, setComment] = useState("");
    const [submitting, setSub] = useState(false);
    const [reviewSuccess, setRS] = useState("");

    useEffect(() => {
        fetch(`/api/student/${regno}`)
            .then((r) => r.json())
            .then((d) => { if (d.success) setData(d.student); else setError(d.error); })
            .catch(() => setError("Failed to load student."))
            .finally(() => setLoading(false));
    }, [regno]);

    async function submitReview(e: React.FormEvent) {
        e.preventDefault();
        if (!action || comment.trim().length < 10) return;
        setSub(true);
        try {
            const res = await fetch("/api/project/review", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: data?.project?._id, action, comment: comment.trim() }),
            });
            const d = await res.json();
            if (d.success) {
                setRS(`Project ${action} successfully!`);
                setAction(""); setComment("");
                // Refresh
                const r = await fetch(`/api/student/${regno}`).then((x) => x.json());
                if (r.success) setData(r.student);
            }
        } finally { setSub(false); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 rounded-full animate-spin"
                    style={{ borderColor: "var(--navy-light)", borderTopColor: "var(--navy)" }} />
            </div>
        );
    }
    if (error) {
        return (
            <div className="py-16 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="font-bold" style={{ color: "var(--navy)" }}>{error}</p>
                <button onClick={() => router.back()} className="mt-4 px-6 py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ background: "var(--navy)" }}>← Go Back</button>
            </div>
        );
    }

    const project = data?.project;
    const status = project?.status;

    return (
        <div className="animate-fade-up space-y-4 pb-4">

            {/* Header */}
            <div className="flex items-center gap-3 pt-1">
                <button onClick={() => router.back()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                    ←
                </button>
                <h1 className="text-lg font-extrabold" style={{ color: "var(--navy)" }}>Student Profile</h1>
            </div>

            {/* Student card */}
            <div className="rounded-3xl p-5 text-white shadow-xl"
                style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-mid))" }}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
                        style={{ background: "var(--gold)" }}>
                        {(data?.name ?? "S")[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-lg font-extrabold">{data?.name}</p>
                        <p className="text-sm opacity-70">{data?.registerNumber}</p>
                        <p className="text-xs opacity-60 mt-0.5">{data?.department} · Batch {data?.batch} · Sec {data?.section}</p>
                    </div>
                </div>
                {status && (
                    <div className="mt-4 inline-block px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: "rgba(255,255,255,0.15)" }}>
                        Project: {STATUS_LABELS[status]}
                    </div>
                )}
            </div>

            {/* No project */}
            {!project && (
                <div className="rounded-2xl p-5 text-center"
                    style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                    <div className="text-3xl mb-2">📭</div>
                    <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>No project submitted yet</p>
                </div>
            )}

            {/* Project details */}
            {project && (
                <>
                    <div className="rounded-2xl p-4 shadow-sm space-y-3"
                        style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Project Details</p>
                        {[
                            { label: "Title", value: project.title },
                            { label: "Guide", value: project.guideName },
                        ].map((r) => (
                            <div key={r.label}>
                                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{r.label}</p>
                                <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>{r.value}</p>
                            </div>
                        ))}
                        <div>
                            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Abstract</p>
                            <p className="text-sm leading-relaxed mt-0.5" style={{ color: "var(--text)" }}>{project.abstract}</p>
                        </div>
                    </div>

                    {/* Tech stack */}
                    {project.techStack?.length > 0 && (
                        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((t) => (
                                    <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: "var(--navy-light)", color: "var(--navy)" }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team */}
                    {project.teamMembers?.length > 0 && (
                        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Team Members</p>
                            {project.teamMembers.map((m, i) => (
                                <div key={i} className="flex justify-between py-2.5 border-b last:border-0"
                                    style={{ borderColor: "var(--border)" }}>
                                    <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{m.name}</span>
                                    <span className="text-xs font-mono py-0.5 px-2 rounded-lg"
                                        style={{ background: "var(--bg)", color: "var(--text-muted)" }}>{m.registerNumber}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Documents */}
                    {(project.proposalUrl || project.reportUrl || project.presentationUrl) && (
                        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Documents</p>
                            {[
                                { key: "proposalUrl", label: "📋 Project Proposal" },
                                { key: "reportUrl", label: "📄 Final Report" },
                                { key: "presentationUrl", label: "📊 Presentation" },
                            ].map(({ key, label }) => {
                                const url = project[key as keyof typeof project] as string;
                                return url ? (
                                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-between py-2.5 border-b last:border-0 hover:opacity-75"
                                        style={{ borderColor: "var(--border)" }}>
                                        <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>{label}</span>
                                        <span className="text-xs font-bold px-3 py-1 rounded-xl"
                                            style={{ background: "var(--navy-light)", color: "var(--navy)" }}>Open →</span>
                                    </a>
                                ) : null;
                            })}
                        </div>
                    )}

                    {/* ── Review Form ──────────────────────────── */}
                    {(status === "submitted" || status === "under_review") && (
                        <form onSubmit={submitReview} className="rounded-2xl p-4 shadow-sm space-y-3"
                            style={{ background: "var(--surface)", border: "2px solid var(--navy-light)" }}>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--navy)" }}>
                                ✍️ Submit Review
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                {(["approved", "rejected"] as const).map((a) => (
                                    <button key={a} type="button" onClick={() => setAction(a)}
                                        className="flex-1 py-3 rounded-xl text-sm font-bold transition border-2"
                                        style={action === a
                                            ? a === "approved"
                                                ? { background: "#DCFCE7", borderColor: "#16A34A", color: "#15803D" }
                                                : { background: "#FEE2E2", borderColor: "#DC2626", color: "#DC2626" }
                                            : { background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                                        {a === "approved" ? "✅ Approve" : "❌ Reject"}
                                    </button>
                                ))}
                            </div>

                            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a detailed review comment (min. 10 characters)…"
                                rows={3} required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                style={{ border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
                                onFocus={(e) => e.currentTarget.style.borderColor = "var(--navy)"}
                                onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />

                            <button type="submit" disabled={!action || comment.trim().length < 10 || submitting}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: action === "approved" ? "var(--success)" : action === "rejected" ? "var(--danger)" : "var(--navy)" }}>
                                {submitting
                                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                                    : `Submit ${action === "approved" ? "Approval" : action === "rejected" ? "Rejection" : "Review"}`}
                            </button>
                        </form>
                    )}

                    {/* Success message */}
                    {reviewSuccess && (
                        <div className="text-sm px-4 py-3 rounded-xl text-center font-semibold"
                            style={{ background: "#DCFCE7", color: "var(--success)" }}>
                            ✅ {reviewSuccess}
                        </div>
                    )}

                    {/* Review history */}
                    {data?.reviewHistory && data.reviewHistory.length > 0 && (
                        <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Review History</p>
                            <div className="space-y-3">
                                {data.reviewHistory.map((r, i) => (
                                    <div key={i} className="rounded-xl p-3"
                                        style={{ background: r.action === "approved" ? "#F0FDF4" : "#FEF2F2" }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold"
                                                style={{ color: r.action === "approved" ? "var(--success)" : "var(--danger)" }}>
                                                {r.action === "approved" ? "✅ Approved" : "❌ Rejected"} by {r.reviewedByName}
                                            </span>
                                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                {new Date(r.reviewedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
