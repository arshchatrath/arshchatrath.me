import { useEffect } from "react";

const SITE = "https://arshchatrath.me";

/** Per-route <title>, description and canonical. The SPA ships one index.html,
 *  so every route would otherwise share the same three tags. */
export function usePageMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", SITE + path);
  }, [title, description, path]);
}
