"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { IStudentDetailClient, STATUS_LABELS } from "@/types";

type PendingProject = {
    _id: string;
    registerNumber: string;
    studentName: string;
    title: string;
    submittedAt: string;
    status: string;
};

export default function StaffDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [result, setResult] = useState<IStudentDetailClient | null>(null);
    const [searching, setSearching] = useState(false);
    const [searchErr, setSearchErr] = useState("");
    const [pendingList, setPendingList] = useState<PendingProject[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    const doSearch = useCallback(async (q: string) => {
        const clean = q.trim();
        if (!clean || clean.length < 6) { setResult(null); setSearchErr(""); return; }
        setSearching(true); setSearchErr("");
        try {
            const res = await fetch(`/api/student/${clean}`);
            const d = await res.json();
            if (d.success) setResult(d.student);
            else { setResult(null); setSearchErr(d.error ?? "Student not found"); }
        } catch { setSearchErr("Search failed — check connection"); }
        finally { setSearching(false); }
    }, []);

    // Debounced search on typing
    useEffect(() => {
        const t = setTimeout(() => doSearch(query), 600);
        return () => clearTimeout(t);
    }, [query, doSearch]);

    // Load pending + stats
    useEffect(() => {
        async function loadData() {
            setStatsLoading(true);
            try {
                const res = await fetch("/api/student/pending");
                const d = await res.json();
                if (d.success) {
                    setPendingList(d.pending ?? []);
                    setStats(d.stats ?? { total: 0, pending: 0, approved: 0, rejected: 0 });
                }
            } catch { /* ignore */ }
            finally { setStatsLoading(false); }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-20 rounded-2xl" style={{ background: "var(--border)" }} />
                <div className="h-14 rounded-2xl" style={{ background: "var(--border)" }} />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: "var(--border)" }} />)}
                </div>
            </div>
        );
    }

    const statusColour = (s: string) =>
        s === "approved" ? { bg: "#DCFCE7", text: "#15803D" }
            : s === "rejected" ? { bg: "#FEE2E2", text: "#DC2626" }
                : s === "submitted" ? { bg: "#DBEAFE", text: "#1D4ED8" }
                    : s === "under_review" ? { bg: "#FEF9C3", text: "#A16207" }
                        : { bg: "#F1F5F9", text: "#64748B" };

    return (
        <div className="space-y-4 animate-fade-up">

            {/* ── MCE Top Header ────────────────────────────────── */}
            <div className="-mx-4 -mt-5 px-4 pt-4 pb-4 flex items-center justify-between"
                style={{ background: "var(--mce-blue)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg p-1">
                        <Image src="/mahendra-logo.png" alt="MCE" width={56} height={56} className="object-contain w-full h-full" unoptimized />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white/70 leading-none">Faculty Portal 👩‍🏫</p>
                        <p className="text-sm font-extrabold text-white leading-tight">
                            {user?.name ?? "Staff"}
                        </p>
                        <p className="text-xs text-white/70 leading-none mt-0.5">
                            {user?.department ?? "MCE"}
                        </p>
                    </div>
                </div>
                <button onClick={logout}
                    className="text-xs font-semibold px-3 py-2 rounded-xl transition"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    Logout
                </button>
            </div>

            {/* ── Stats Row ─────────────────────────────────────── */}
            {!statsLoading ? (
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: "Students", value: stats.total, bg: "var(--mce-blue-light)", text: "var(--mce-blue-dark)" },
                        { label: "Pending", value: stats.pending, bg: "#FEF9C3", text: "#A16207" },
                        { label: "Approved", value: stats.approved, bg: "#DCFCE7", text: "#15803D" },
                        { label: "Rejected", value: stats.rejected, bg: "#FEE2E2", text: "#DC2626" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-3 text-center shadow-sm"
                            style={{ background: s.bg }}>
                            <p className="text-xl font-extrabold" style={{ color: s.text }}>{s.value}</p>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: s.text, opacity: 0.8 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-2xl" style={{ background: "var(--border)" }} />)}
                </div>
            )}

            {/* ── Search Bar ────────────────────────────────────── */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}>Search by Register Number</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">🔍</span>
                    <input
                        type="text" value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="e.g. 621523205001"
                        maxLength={12}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none shadow-sm transition"
                        style={{
                            border: "2px solid var(--mce-blue)", background: "var(--surface)",
                            color: "var(--text)", fontFamily: "monospace", letterSpacing: "0.05em",
                        }}
                        onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.2)"}
                        onBlur={e => e.currentTarget.style.boxShadow = "none"}
                    />
                    {searching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin block"
                                style={{ borderColor: "var(--mce-blue)", borderTopColor: "transparent" }} />
                        </div>
                    )}
                </div>

                {/* Search result */}
                {searchErr && (
                    <div className="mt-3 rounded-2xl p-4 flex items-center gap-3"
                        style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                        <span className="text-2xl">⚠️</span>
                        <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>{searchErr}</p>
                    </div>
                )}
                {result && !searchErr && (
                    <Link href={`/student/${result.registerNumber}`}
                        className="mt-3 flex items-center gap-4 rounded-2xl p-4 shadow-sm transition active:scale-95"
                        style={{ background: "var(--surface)", border: "2px solid var(--mce-blue)" }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold flex-shrink-0 text-white"
                            style={{ background: "var(--mce-blue)" }}>
                            {(result.name ?? "S")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-sm truncate" style={{ color: "var(--text)" }}>{result.name}</p>
                            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{result.registerNumber}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{result.department} · Batch {result.batch}</p>
                        </div>
                        {result.project?.status && (() => {
                            const c = statusColour(result.project!.status);
                            return (
                                <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap"
                                    style={{ background: c.bg, color: c.text }}>
                                    {STATUS_LABELS[result.project!.status as keyof typeof STATUS_LABELS] ?? result.project!.status}
                                </span>
                            );
                        })()}
                        <span className="text-xl opacity-50">→</span>
                    </Link>
                )}
            </div>

            {/* ── Pending Approvals ─────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Pending Approvals
                    </p>
                    {pendingList.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#FEF9C3", color: "#A16207" }}>
                            {pendingList.length}
                        </span>
                    )}
                </div>

                {statsLoading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl" style={{ background: "var(--border)" }} />)}
                    </div>
                ) : pendingList.length === 0 ? (
                    <div className="rounded-2xl p-6 text-center"
                        style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                        <div className="text-3xl mb-2">✅</div>
                        <p className="font-bold text-sm" style={{ color: "var(--text)" }}>All caught up!</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>No pending submissions to review</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingList.map(p => (
                            <Link key={p._id} href={`/student/${p.registerNumber}`}
                                className="flex items-center gap-3 rounded-2xl p-4 shadow-sm transition active:scale-95"
                                style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white flex-shrink-0"
                                    style={{ background: "var(--mce-blue)" }}>
                                    {(p.studentName ?? "S")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate" style={{ color: "var(--text)" }}>{p.studentName}</p>
                                    <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{p.registerNumber}</p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{p.title}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
                                        Pending
                                    </span>
                                    <span className="text-xs text-gray-400">Review →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
