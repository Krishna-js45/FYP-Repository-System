"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function StaffProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
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
                <p className="text-sm opacity-70 mt-0.5">{user?.email}</p>
                <span className="inline-block mt-3 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(245,166,35,0.2)", color: "var(--gold)" }}>
                    👩‍🏫 Faculty
                </span>
            </div>

            <div className="rounded-2xl p-4 shadow-sm" style={{ background: "var(--surface)", border: "1.5px solid var(--border)" }}>
                {[
                    { label: "Department", value: user?.department ?? "—" },
                ].map((row) => (
                    <div key={row.label} className="flex justify-between py-3 border-b last:border-0"
                        style={{ borderColor: "var(--border)" }}>
                        <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{row.label}</span>
                        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{row.value}</span>
                    </div>
                ))}
                <button onClick={logout}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition"
                    style={{ background: "#FEE2E2", color: "var(--danger)", border: "1.5px solid #FECACA" }}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );
}
