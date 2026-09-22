import { usePageMeta } from "@/lib/page-meta";

export default function Figma() {
  usePageMeta(
    "Figma Portfolio — Arsh Chatrath",
    "Interactive Figma prototype of Arsh Chatrath's product design and case study work.",
    "/figma",
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-[0.3em] text-[#f5f0e8]/70 transition-colors hover:text-[#00B4D8]"
        >
          ← Arsh Chatrath
        </a>
        <a
          href="/resume"
          className="font-mono text-xs uppercase tracking-[0.3em] text-[#00B4D8] hover:underline"
        >
          Resume
        </a>
      </div>
      <iframe
        title="Figma portfolio prototype by Arsh Chatrath"
        src="https://embed.figma.com/proto/Bf9oPJM6LaN1OcdMA5hM75/Me----the-portfolio?node-id=359-2712&p=f&viewport=158%2C166%2C0.32&scaling=scale-down-width&content-scaling=fixed&page-id=359%3A2711&embed-host=share&hide-ui=1"
        className="h-[calc(100vh-49px)] w-full border-0"
        allowFullScreen
      />
    </div>
  );
}
