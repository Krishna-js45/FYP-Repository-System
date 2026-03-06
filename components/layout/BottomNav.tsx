"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface BottomNavProps {
    items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
    const path = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
            <div className="max-w-sm mx-auto flex">
                {items.map((item) => {
                    const active = path.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <span className={`w-6 h-6 transition-transform ${active ? "scale-110" : ""}`}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {active && (
                                <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
