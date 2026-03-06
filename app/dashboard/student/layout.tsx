"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
    {
        href: "/dashboard/student",
        label: "Home",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12l8.954-8.954a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
            </svg>
        ),
    },
    {
        href: "/dashboard/student/submit",
        label: "My Project",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
    },
    {
        href: "/dashboard/student/documents",
        label: "Upload",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
        ),
    },
    {
        href: "/dashboard/student/profile",
        label: "Profile",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
        ),
    },
];

export default function StudentAppLayout({ children }: { children: React.ReactNode }) {
    const path = usePathname();

    return (
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
            <main className="max-w-sm mx-auto px-4 pt-5 pb-24">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 nav-safe-bottom"
                style={{ background: "var(--surface)", borderTop: "1.5px solid var(--border)", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
                <div className="max-w-sm mx-auto flex">
                    {NAV.map((item) => {
                        const active = path === item.href ||
                            (item.href !== "/dashboard/student" && path.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}
                                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-all duration-150"
                                style={{ color: active ? "var(--mce-blue)" : "var(--text-muted)" }}>
                                {/* Active indicator */}
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                                        style={{ background: "var(--mce-blue)" }} />
                                )}
                                <span style={{ transform: active ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s" }}>
                                    {item.icon}
                                </span>
                                <span className="text-xs font-semibold">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
