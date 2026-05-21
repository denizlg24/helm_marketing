import {
  CloudOff,
  Layers,
  Lock,
  MonitorSmartphone,
  PackageOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

const principles: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Private by default",
    body: "Life data is never public unless a publishing module explicitly exposes it — and only behind isolated tenant routes.",
    icon: Lock,
  },
  {
    title: "Modular by design",
    body: "Every feature is a registered module. Enable, disable, configure, and bill independently.",
    icon: Layers,
  },
  {
    title: "Desktop-first, web-capable",
    body: "Tauri-based desktop app for daily power use. Web supports setup, billing, and emergency access.",
    icon: MonitorSmartphone,
  },
  {
    title: "AI as operator",
    body: "Read tools run immediately. Write tools wait. High-risk actions always require approval.",
    icon: Sparkles,
  },
  {
    title: "Local where it matters",
    body: "Embeddings, notifications, timers, and exports run on your device — without forcing everything through the cloud.",
    icon: CloudOff,
  },
  {
    title: "Data portability",
    body: "Export and deletion are first-class. You can leave any time. No revolving doors.",
    icon: PackageOpen,
  },
];

export function Principles() {
  return (
    <section
      aria-labelledby="principles-heading"
      className="border-t border-border/40 bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            Principles
          </p>
          <h2
            id="principles-heading"
            className="mt-3 text-balance font-[var(--font-calistoga)] text-4xl leading-tight tracking-tight text-primary md:text-5xl"
          >
            Opinions, where it counts.{" "}
            <em className="italic text-accent-strong/90">Constraints, everywhere else.</em>
          </h2>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={Math.min(i * 60, 360)} className="relative">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium tabular-nums tracking-wide text-muted-foreground/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-border" />
                <p.icon className="size-4 text-accent-strong" />
              </div>
              <h3 className="mt-4 font-[var(--font-calistoga)] text-2xl tracking-tight text-primary">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
