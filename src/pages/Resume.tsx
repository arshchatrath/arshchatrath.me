export default function Resume() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <iframe
        title="Resume PDF"
        src="/resume.pdf"
        className="h-screen w-full border-0"
      >
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center text-slate-300">
          <p>Your browser does not support inline PDF viewing.</p>
          <a
            href="/resume.pdf"
            download
            className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
          >
            Download PDF
          </a>
        </div>
      </iframe>

      <a
        href="/resume.pdf"
        download
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-cyan-500/30 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:bottom-5 sm:right-5"
      >
        Download as PDF
      </a>
    </div>
  );
}
