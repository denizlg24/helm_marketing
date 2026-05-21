"use client";

import { useEffect } from "react";

type Props = {
  sectionIds: string[];
  /** Treat a section as "in view" when this ratio is visible. */
  threshold?: number;
};

/**
 * Watches given section ids and clears the URL hash when none of them is
 * currently in view. Prevents stale anchors like `#demo` sticking around as
 * the visitor scrolls past.
 */
export function HashCleaner({ sectionIds, threshold = 0.25 }: Props) {
  useEffect(() => {
    const visible = new Set<string>();
    let scheduled = false;

    const flush = () => {
      scheduled = false;
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      if (sectionIds.includes(hash) && !visible.has(hash)) {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(flush);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        schedule();
      },
      { threshold },
    );

    const observed: Element[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        io.observe(el);
        observed.push(el);
      }
    }

    return () => io.disconnect();
  }, [sectionIds, threshold]);

  return null;
}
