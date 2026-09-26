import { usePageMeta } from "@/lib/page-meta";

export default function Resume() {
  usePageMeta(
    "Resume · Arsh Chatrath, Product Builder",
    "Download or read Arsh Chatrath's resume: product and growth experience at Talkeys, Perplexity Campus Partner, national competition wins.",
    "/resume",
  );

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5f0e8]/70 transition-colors hover:text-[#00B4D8]"
        >
          ← Arsh Chatrath
        </a>
        <a
          href="/figma"
          className="font-mono text-xs uppercase tracking-[0.3em] text-[#00B4D8] hover:underline"
        >
          Figma Portfolio
        </a>
      </div>

      <iframe
        title="Resume of Arsh Chatrath (PDF)"
        src="/resume.pdf"
        className="h-[calc(100vh-49px)] w-full border-0"
      >
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center text-[#f5f0e8]/70">
          <p>Your browser does not support inline PDF viewing.</p>
          <a
            href="/resume.pdf"
            download
            className="rounded-full bg-[#00B4D8] px-4 py-2 text-sm font-semibold text-[#0a0a0a]"
          >
            Download PDF
          </a>
        </div>
      </iframe>

      <a
        href="/resume.pdf"
        download
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-[#00B4D8] px-4 py-3 text-sm font-semibold text-[#0a0a0a] shadow-2xl shadow-[#00B4D8]/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] sm:bottom-5 sm:right-5"
      >
        Download as PDF
      </a>
    </div>
  );
}
