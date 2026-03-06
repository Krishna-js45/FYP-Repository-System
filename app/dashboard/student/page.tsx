"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { STATUS_LABELS } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const STEPS = [
    { key: "draft", label: "Draft" },
    { key: "submitted", label: "Submitted" },
    { key: "under_review", label: "In Review" },
    { key: "approved", label: "Approved" },
] as const;

export default function StudentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { project, loading: projLoading } = useProject();
    const router = useRouter();

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    if (authLoading || projLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {/* Skeleton header */}
                <div className="h-20 rounded-2xl" style={{ background: "var(--border)" }} />
                <div className="h-40 rounded-3xl" style={{ background: "var(--border)" }} />
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-2xl" style={{ background: "var(--border)" }} />
                    <div className="h-24 rounded-2xl" style={{ background: "var(--border)" }} />
                </div>
            </div>
        );
    }

    const status = project?.status;
    const stepIdx = status === "rejected" ? -1
        : STEPS.findIndex(s => s.key === (status ?? "draft"));

    return (
        <div className="space-y-4 animate-fade-up">

            {/* ── MCE Top Header ───────────────────────────────── */}
            <div className="-mx-4 -mt-5 px-4 pt-4 pb-4 flex items-center justify-between"
                style={{ background: "var(--mce-blue)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg p-1">
                        <Image src="/mahendra-logo.png" alt="MCE" width={56} height={56} className="object-contain w-full h-full" unoptimized />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white/70 leading-none">Good {greeting()} 👋</p>
                        <p className="text-sm font-extrabold text-white leading-tight">
                            {user?.name ?? "Student"}
                        </p>
                        <p className="text-xs text-white/70 font-mono leading-none mt-0.5">
                            {user?.registerNumber}
                        </p>
                    </div>
                </div>
                <button onClick={logout}
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    Logout
                </button>
            </div>

            {/* ── Notification Banner ───────────────────────────── */}
            {status === "approved" && (
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3 animate-fade-up"
                    style={{ background: "#DCFCE7", border: "1.5px solid #86EFAC" }}>
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-bold text-sm" style={{ color: "#15803D" }}>Your project has been approved!</p>
                        {project?.latestReviewComment && (
                            <p className="text-xs mt-0.5" style={{ color: "#166534" }}>{project.latestReviewComment}</p>
                        )}
                    </div>
                </div>
            )}
            {status === "rejected" && (
                <div className="rounded-2xl px-4 py-3 flex items-start gap-3 animate-fade-up"
                    style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                    <span className="text-2xl mt-0.5">❌</span>
                    <div>
                        <p className="font-bold text-sm" style={{ color: "#DC2626" }}>Project Rejected</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#991B1B" }}>
                            {project?.latestReviewComment ?? "No reason provided."}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Project Status Card ──────────────────────────── */}
            <div className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
                style={{
                    background: status === "approved"
                        ? "linear-gradient(135deg,#15803D,#16A34A)"
                        : status === "rejected"
                            ? "linear-gradient(135deg,#DC2626,#EF4444)"
                            : "linear-gradient(135deg,var(--mce-blue),var(--mce-blue-dark))"
                }}>
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15"
                    style={{ background: "#fff" }} />
                <p className="text-xs font-semibold opacity-70 mb-1">Project Status</p>
                <p className="text-2xl font-extrabold mb-1">
                    {status ? STATUS_LABELS[status] : "Not Started"}
                </p>
                {!status && (
                    <p className="text-sm opacity-75">Start your FYP submission →</p>
                )}

                {/* Progress steps */}
                {status && status !== "rejected" && (
                    <div className="mt-4">
                        <div className="flex items-center gap-0">
                            {STEPS.map((s, i) => {
                                const done = i <= stepIdx;
                                const active = i === stepIdx;
                                return (
                                    <div key={s.key} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? "1" : "0" }}>
                                        {/* Dot */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all ${done ? "bg-white" : "bg-transparent"}`}>
                                                {done && <div className="w-2 h-2 rounded-full" style={{ background: active ? "var(--mce-blue)" : (status === "approved" ? "#15803D" : "var(--mce-blue)") }} />}
                                            </div>
                                            <span className="text-xs font-semibold whitespace-nowrap opacity-80" style={{ fontSize: "0.6rem" }}>{s.label}</span>
                                        </div>
                                        {/* Line */}
                                        {i < STEPS.length - 1 && (
                                            <div className="h-0.5 flex-1 mx-1 rounded-full transition-all"
                                                style={{ background: i < stepIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)" }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Project Details Card ─────────────────────────── */}
            {project && (
                <div className="rounded-2xl p-4 shadow-sm"
                    style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            My Project
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold badge-${status}`}>
                            {STATUS_LABELS[status!]}
                        </span>
                    </div>
                    <p className="font-extrabold text-sm mb-1" style={{ color: "var(--text)" }}>
                        {project.title}
                    </p>
                    {project.guideName && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Guide: {project.guideName}</p>
                    )}
                    {project.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {project.techStack.slice(0, 5).map(t => (
                                <span key={t} className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "var(--mce-blue-light)", color: "var(--mce-blue-dark)" }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                    {project.teamMembers?.length > 0 && (
                        <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Team</p>
                            {project.teamMembers.map((m, i) => (
                                <p key={i} className="text-xs" style={{ color: "var(--text)" }}>• {m.name}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Documents Section ─────────────────────────────── */}
            <div className="rounded-2xl p-4 shadow-sm"
                style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Documents</p>
                    <Link href="/dashboard/student/documents"
                        className="text-xs font-bold px-3 py-1 rounded-xl"
                        style={{ background: "var(--mce-blue-light)", color: "var(--mce-blue)" }}>
                        Manage →
                    </Link>
                </div>
                {[
                    { key: "proposalUrl", icon: "📋", label: "Project Proposal" },
                    { key: "reportUrl", icon: "📄", label: "Final Report" },
                    { key: "presentationUrl", icon: "📊", label: "Presentation (PPT)" },
                ].map(({ key, icon, label }) => {
                    const uploaded = !!(project as Record<string, unknown> | null)?.[key];
                    return (
                        <div key={key} className="flex items-center justify-between py-2.5"
                            style={{ borderBottom: "1px solid var(--border)" }}>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{icon}</span>
                                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{label}</p>
                            </div>
                            {uploaded
                                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#15803D" }}>Uploaded ✓</span>
                                : <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "var(--text-muted)" }}>Not uploaded</span>
                            }
                        </div>
                    );
                })}
                <div className="pt-1" />
            </div>

            {/* ── Quick Actions ─────────────────────────────────── */}
            {(!project || status === "draft" || status === "rejected") && (
                <Link href="/dashboard/student/submit"
                    className="flex items-center gap-4 rounded-2xl p-4 transition active:scale-95 shadow-sm"
                    style={{ background: "var(--mce-blue)", color: "#fff" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.15)" }}>
                        {!project ? "📝" : "✏️"}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{!project ? "Submit Your Project" : "Edit & Resubmit"}</p>
                        <p className="text-xs opacity-70">{!project ? "Start your FYP submission" : "Update rejected project"}</p>
                    </div>
                    <span className="ml-auto text-xl opacity-80">→</span>
                </Link>
            )}
        </div>
    );
}

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}
