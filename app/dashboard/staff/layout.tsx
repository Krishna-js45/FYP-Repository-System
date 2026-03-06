"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
    {
        href: "/dashboard/staff",
        label: "Home",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12l8.954-8.954a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
            </svg>
        ),
    },
    {
        href: "/dashboard/staff/search",
        label: "Search",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
        ),
    },
    {
        href: "/dashboard/staff/profile",
        label: "Profile",
        icon: (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
        ),
    },
];

export default function StaffAppLayout({ children }: { children: React.ReactNode }) {
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
                            (item.href !== "/dashboard/staff" && path.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}
                                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-all duration-150"
                                style={{ color: active ? "var(--mce-blue)" : "var(--text-muted)" }}>
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
