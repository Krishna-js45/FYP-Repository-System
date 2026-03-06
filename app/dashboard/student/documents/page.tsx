"use client";

import { useState } from "react";
import { useProject } from "@/hooks/useProject";

type DocType = "proposal" | "report" | "presentation";

const DOCS: { type: DocType; label: string; icon: string; desc: string }[] = [
    { type: "proposal", label: "Project Proposal", icon: "📋", desc: "PDF — Project plan and objectives" },
    { type: "report", label: "Final Report", icon: "📄", desc: "PDF — Complete project report" },
    { type: "presentation", label: "Presentation Slides", icon: "📊", desc: "PPT/PPTX/PDF — Your slideshow" },
];

export default function DocumentsPage() {
    const { project, loading, refetch } = useProject();
    const [uploading, setUploading] = useState<DocType | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toasts, setToasts] = useState<string[]>([]);

    function toast(msg: string) {
        setToasts((t) => [...t, msg]);
        setTimeout(() => setToasts((t) => t.slice(1)), 3000);
    }

    async function handleFileChange(docType: DocType, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const ALLOWED = ["application/pdf", "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
        if (!ALLOWED.includes(file.type)) {
            setErrors((err) => ({ ...err, [docType]: "Only PDF, PPT, or PPTX files allowed." }));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrors((err) => ({ ...err, [docType]: "File too large. Max size is 10MB." }));
            return;
        }

        setErrors((err) => ({ ...err, [docType]: "" }));
        setUploading(docType);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("docType", docType);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (!data.success) { setErrors((err) => ({ ...err, [docType]: data.error })); return; }
            toast(`${DOCS.find(d => d.type === docType)?.label} uploaded successfully!`);
            refetch();
        } catch { setErrors((err) => ({ ...err, [docType]: "Upload failed. Try again." })); }
        finally { setUploading(null); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 rounded-full animate-spin"
                    style={{ borderColor: "var(--navy-light)", borderTopColor: "var(--navy)" }} />
            </div>
        );
    }

    const urls: Record<DocType, string> = {
        proposal: project?.proposalUrl ?? "",
        report: project?.reportUrl ?? "",
        presentation: project?.presentationUrl ?? "",
    };

    return (
        <div className="animate-fade-up space-y-4">

            {/* Toasts */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none">
                {toasts.map((t, i) => (
                    <div key={i} className="bg-green-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-up">
                        ✅ {t}
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="pt-1">
                <h1 className="text-xl font-extrabold" style={{ color: "var(--navy)" }}>Documents</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Upload your project files (PDF, PPT · max 10MB each)
                </p>
            </div>

            {!project && (
                <div className="rounded-2xl p-5 text-center"
                    style={{ background: "#FFF8E7", border: "1.5px solid #FDE68A" }}>
                    <p className="text-2xl mb-2">📝</p>
                    <p className="font-bold text-sm" style={{ color: "#92400E" }}>Submit your project first</p>
                    <p className="text-xs mt-1" style={{ color: "#A16207" }}>You need to submit project details before uploading documents.</p>
                </div>
            )}

            {/* Document slots */}
            {DOCS.map(({ type, label, icon, desc }) => {
                const url = urls[type];
                const isLoading = uploading === type;

                return (
                    <div key={type} className="rounded-2xl p-4 shadow-sm"
                        style={{ background: "var(--surface)", border: `1.5px solid ${url ? "var(--navy-light)" : "var(--border)"}` }}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                    style={{ background: url ? "var(--navy-light)" : "var(--bg)" }}>
                                    {icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>{label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                                    {url && (
                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5 hover:underline"
                                            style={{ color: "var(--navy)" }}>
                                            🔗 View file
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Upload button */}
                            <label className={`flex-shrink-0 cursor-pointer px-3 py-2 rounded-xl text-xs font-bold transition ${!project ? "opacity-40 pointer-events-none" : ""}`}
                                style={url
                                    ? { background: "var(--navy-light)", color: "var(--navy)" }
                                    : { background: "var(--gold)", color: "#fff", boxShadow: "0 2px 8px rgba(245,166,35,0.4)" }}>
                                {isLoading
                                    ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading</span>
                                    : url ? "Replace" : "Upload"}
                                <input type="file" className="hidden" accept=".pdf,.ppt,.pptx"
                                    disabled={!project || isLoading}
                                    onChange={(e) => handleFileChange(type, e)} />
                            </label>
                        </div>

                        {errors[type] && (
                            <p className="text-xs mt-2 px-3 py-2 rounded-lg"
                                style={{ background: "#FEE2E2", color: "var(--danger)" }}>
                                ⚠️ {errors[type]}
                            </p>
                        )}

                        {url && (
                            <div className="mt-2 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                                <span className="text-xs font-medium" style={{ color: "var(--success)" }}>Uploaded</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
