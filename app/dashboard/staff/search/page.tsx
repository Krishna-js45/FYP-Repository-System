"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IStudentDetailClient, STATUS_LABELS, STATUS_COLORS } from "@/types";

export default function StaffSearchPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<IStudentDetailClient | null>(null);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const router = useRouter();

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        setError(""); setStudent(null); setSearched(false); setLoading(true);
        try {
            const res = await fetch(`/api/student/${query.trim().toUpperCase()}`);
            const data = await res.json();
            setSearched(true);
            if (!data.success) { setError(data.error || "Student not found"); return; }
            setStudent(data.student);
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    }

    return (
        <div className="animate-fade-up space-y-4">

            {/* Header */}
            <div className="pt-1">
                <h1 className="text-xl font-extrabold" style={{ color: "var(--navy)" }}>Search Students</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Enter register number to find a student</p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch}>
                <div className="flex gap-2">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value.toUpperCase())}
                        placeholder="Register number e.g. 22CS001"
                        className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none font-semibold uppercase"
                        style={{ border: "2px solid var(--navy)", background: "var(--surface)", color: "var(--text)", letterSpacing: "0.05em" }}
                    />
                    <button type="submit" disabled={loading}
                        className="px-5 rounded-2xl font-bold text-sm text-white transition active:scale-95 disabled:opacity-60 flex items-center gap-2"
                        style={{ background: "var(--navy)", boxShadow: "0 4px 12px rgba(30,58,95,0.35)", minWidth: "80px" }}>
                        {loading
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <>🔍 Find</>}
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 rounded-2xl text-sm font-medium"
                    style={{ background: "#FEE2E2", color: "var(--danger)", border: "1.5px solid #FECACA" }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Result card */}
            {student && (
                <div
                    onClick={() => router.push(`/student/${student.registerNumber}`)}
                    className="rounded-2xl p-4 shadow-sm cursor-pointer transition active:scale-95 hover:shadow-md"
                    style={{ background: "var(--surface)", border: "1.5px solid var(--navy-light)" }}>
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold flex-shrink-0 text-white"
                            style={{ background: "var(--navy)" }}>
                            {(student.name ?? "S")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-extrabold" style={{ color: "var(--navy)" }}>{student.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {student.registerNumber} · {student.department} · Batch {student.batch}
                            </p>
                            <div className="mt-2">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full badge-${student.project?.status ?? "draft"}`}>
                                    {student.project ? STATUS_LABELS[student.project.status] : "No Submission"}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: "var(--navy-mid)" }}>→</div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {searched && !student && !error && (
                <div className="text-center py-10">
                    <div className="text-5xl mb-3">🔍</div>
                    <p className="font-bold" style={{ color: "var(--navy)" }}>No student found</p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Check the register number and try again.</p>
                </div>
            )}

            {/* Instruction card */}
            {!searched && (
                <div className="rounded-2xl p-5 text-center"
                    style={{ background: "var(--navy-light)", border: "1.5px solid var(--border)" }}>
                    <div className="text-3xl mb-2">🎓</div>
                    <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>Find any student</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Type the full register number above and press Find. You can then view their project details and approve or reject it.
                    </p>
                </div>
            )}
        </div>
    );
}
