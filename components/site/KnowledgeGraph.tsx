"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Loading graph…</div>,
});

const data = {
  nodes: [
    { id: "manifesto", group: 1, val: 8 },
    { id: "modules", group: 2, val: 12 },
    { id: "assistant", group: 2, val: 10 },
    { id: "principles", group: 1, val: 6 },
    { id: "mvp", group: 3, val: 5 },
    { id: "email", group: 3, val: 4 },
    { id: "kanban", group: 3, val: 5 },
    { id: "people", group: 3, val: 4 },
    { id: "resources", group: 3, val: 5 },
    { id: "notes", group: 1, val: 7 },
  ],
  links: [
    { source: "manifesto", target: "modules" },
    { source: "manifesto", target: "principles" },
    { source: "modules", target: "assistant" },
    { source: "modules", target: "kanban" },
    { source: "modules", target: "people" },
    { source: "modules", target: "resources" },
    { source: "assistant", target: "email" },
    { source: "principles", target: "mvp" },
    { source: "mvp", target: "kanban" },
    { source: "notes", target: "manifesto" },
    { source: "notes", target: "assistant" },
  ],
};

const colors: Record<number, string> = {
  1: "#303630",
  2: "#a1bc98",
  3: "#647560",
};

export function KnowledgeGraph() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full">
      {size.w > 0 && (
        <ForceGraph2D
          graphData={data}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={4}
          linkColor={() => "rgba(100,117,96,0.35)"}
          linkWidth={1}
          cooldownTicks={120}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          nodeCanvasObject={(node, ctx, scale) => {
            const n = node as { id: string; x: number; y: number; group: number; val: number };
            const r = Math.sqrt(n.val) * 2.6;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = colors[n.group] ?? "#647560";
            ctx.fill();

            const label = n.id;
            const fontSize = 11 / Math.max(scale, 1);
            ctx.font = `${fontSize}px Inter, ui-sans-serif, system-ui`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#303630";
            ctx.fillText(label, n.x + r + 3, n.y);
          }}
        />
      )}
    </div>
  );
}
