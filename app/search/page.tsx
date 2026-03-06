"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IStudentDetailClient, STATUS_LABELS, STATUS_COLORS } from "@/types";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState<IStudentDetailClient | null>(null);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        setError("");
        setStudent(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/student/${query.trim().toUpperCase()}`);
            const data = await res.json();
            if (!data.success) { setError(data.error); return; }
            setStudent(data.student);
        } catch { setError("Network error. Please try again."); }
        finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-sm mx-auto px-4 pt-6 pb-24 space-y-4">
                <h1 className="text-xl font-bold text-gray-900">🔍 Search Student</h1>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter register number e.g. 22CS001"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button type="submit" disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60">
                        {loading ? "…" : "Search"}
                    </button>
                </form>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

                {student && (
                    <div
                        onClick={() => router.push(`/student/${student.registerNumber}`)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-600">
                                {student.name?.[0] ?? "S"}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.registerNumber} · {student.department}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${student.project ? STATUS_COLORS[student.project.status] : "bg-gray-100 text-gray-500"
                                }`}>
                                {student.project ? STATUS_LABELS[student.project.status] : "No Project"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Bottom nav */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                    <div className="max-w-sm mx-auto flex">
                        {[
                            { href: "/dashboard", label: "Home", emoji: "🏠" },
                            { href: "/search", label: "Search", emoji: "🔍" },
                            { href: "/sprofile", label: "Profile", emoji: "👤" },
                        ].map((item) => (
                            <a key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-gray-500 hover:text-indigo-600 transition">
                                <span className="text-lg">{item.emoji}</span>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}
