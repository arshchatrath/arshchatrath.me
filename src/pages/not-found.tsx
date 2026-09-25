import { usePageMeta } from "@/lib/page-meta";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Case studies" },
  { href: "/#faq", label: "FAQ" },
  { href: "/resume", label: "Resume" },
  { href: "/figma", label: "Figma portfolio" },
  { href: "mailto:achatrath_be23@thapar.edu", label: "Email me" },
];

export default function NotFound() {
  usePageMeta(
    "Page not found — Arsh Chatrath",
    "That page doesn't exist. Head back to the portfolio, resume or case studies.",
    "/404",
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-[#f5f0e8]">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#00B4D8]">
        404
      </p>
      <h1
        className="mt-4 text-4xl md:text-6xl"
        style={{ fontFamily: "var(--ff-display)", fontWeight: 800 }}
      >
        This page doesn't exist
      </h1>
      <p
        className="mt-4 max-w-md text-[#f5f0e8]/60"
        style={{ fontFamily: "var(--ff-body)" }}
      >
        The link is broken or the page moved. Here's everything else worth seeing.
      </p>

      <nav
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
        style={{ fontFamily: "var(--ff-body)" }}
      >
        {LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-[#f5f0e8]/80 transition-colors hover:border-[#00B4D8] hover:text-[#00B4D8]"
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
