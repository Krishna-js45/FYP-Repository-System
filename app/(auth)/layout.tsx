import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
            style={{ background: "linear-gradient(160deg, var(--mce-blue) 0%, var(--mce-blue-dark) 60%, #075985 100%)" }}>

            {/* MCE Brand header */}
            <div className="text-center mb-8">
                {/* College logo */}
                <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-xl overflow-hidden p-2">
                    <Image
                        src="/mahendra-logo.png"
                        alt="Mahendra College of Engineering"
                        width={88}
                        height={88}
                        className="object-contain w-full h-full"
                        unoptimized
                    />
                </div>
                <h1 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                    Mahendra College of Engineering
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                    MCE Final Year Project Management Portal
                </p>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm rounded-3xl shadow-2xl p-6"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {children}
            </div>
        </div>
    );
}
