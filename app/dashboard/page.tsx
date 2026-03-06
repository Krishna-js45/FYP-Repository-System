"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) { router.replace("/login"); return; }
        if (user.role === "staff") router.replace("/dashboard/staff");
        else router.replace("/dashboard/student");
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
            <div className="w-10 h-10 border-4 rounded-full animate-spin"
                style={{ borderColor: "var(--navy-light)", borderTopColor: "var(--navy)" }} />
        </div>
    );
}
