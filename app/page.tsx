import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Top Nav ─────────────────────────────────────── */}
      <header style={{ background: "var(--mce-blue)" }} className="px-5 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {/* College logo */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-lg p-1">
            <Image
              src="/mahendra-logo.png"
              alt="Mahendra College of Engineering"
              width={60}
              height={60}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">Mahendra College of Engineering</p>
            <p className="text-white/70 text-xs leading-none">MCE Final Year Project Management Portal</p>
          </div>
        </div>
        <Link href="/login"
          className="text-sm font-semibold px-4 py-2 rounded-lg border-2 border-white/40 text-white hover:bg-white/15 transition">
          Sign In
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{ background: "linear-gradient(160deg, var(--mce-blue) 0%, var(--mce-blue-dark) 60%, #075985 100%)" }}
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative overflow-hidden">

        {/* Decorative rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"
            style={{ background: "#fff" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 translate-y-1/3 -translate-x-1/4"
            style={{ background: "#fff" }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
          🎓 Mahendra College of Engineering — Official Portal
        </div>

        {/* College logo big */}
        <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-2xl overflow-hidden p-2">
          <Image
            src="/mahendra-logo.png"
            alt="MCE Logo"
            width={88}
            height={88}
            className="object-contain w-full h-full"
            unoptimized
          />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3 leading-tight">
          MCE Final Year<br />
          <span style={{ color: "#BAE6FD" }}>Project Portal</span>
        </h1>
        <p className="text-white/70 text-sm max-w-xs leading-relaxed mb-2">
          Mahendra College of Engineering
        </p>
        <p className="text-white/60 text-xs max-w-xs leading-relaxed mb-10">
          Submit, track, and manage Final Year Projects in one secure portal — built for students and faculty.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/login?role=student"
            className="w-full py-4 rounded-2xl font-bold text-base text-center shadow-lg transition active:scale-95"
            style={{ background: "#fff", color: "var(--mce-blue)" }}>
            🎓 Login as Student
          </Link>
          <Link href="/login?role=staff"
            className="w-full py-4 rounded-2xl font-bold text-base text-center border-2 transition active:scale-95"
            style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff", background: "rgba(255,255,255,0.1)" }}>
            👩‍🏫 Login as Staff
          </Link>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section style={{ background: "var(--bg)" }} className="px-5 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: "var(--text-muted)" }}>Everything you need</p>
        <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
          {[
            { icon: "📤", title: "Easy Submission", desc: "Submit project details, guide info, and team in a guided multi-step form." },
            { icon: "📊", title: "Live Status Tracking", desc: "Track your project from Draft to Approved in real‑time." },
            { icon: "📁", title: "Document Storage", desc: "Upload your Proposal, Report, and PPT securely via Cloudinary." },
            { icon: "✅", title: "Faculty Review", desc: "Staff can search, review, and approve or reject submissions with feedback." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 p-4 rounded-2xl shadow-sm border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</div>
              <div>
                <p className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ background: "var(--mce-blue-dark)" }} className="py-5 text-center">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          © 2026 Mahendra College of Engineering · MCE Final Year Project Management Portal
        </p>
      </footer>
    </div>
  );
}
