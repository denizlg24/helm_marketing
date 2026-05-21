import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[520px] max-w-5xl animate-in fade-in rounded-[100%] bg-gradient-to-b from-accent/30 via-surface/60 to-transparent blur-3xl duration-[1400ms]"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-24 text-center md:pt-32">
        <h1
          id="hero-heading"
          className="max-w-[20ch] animate-in fade-in slide-in-from-bottom-3 text-balance font-[var(--font-calistoga)] text-5xl leading-[1.02] tracking-tight text-primary duration-700 md:text-7xl"
        >
          The console for
          <br className="hidden sm:inline" /> the life{" "}
          <em className="font-[var(--font-calistoga)] italic text-accent-strong/90">you&apos;re actually</em>{" "}
          running.
        </h1>

        <p className="mt-7 max-w-[58ch] animate-in fade-in slide-in-from-bottom-2 text-balance text-base leading-relaxed text-muted-foreground duration-700 [animation-delay:120ms] [animation-fill-mode:both] md:text-lg">
          Helm is a private, modular dashboard for the things that run your
          week — notes, tasks, schedule, people, inbox, and infrastructure.
          Shape it around your own systems. Let the assistant handle the boring
          parts under your approval.
        </p>

        <div className="mt-9 animate-in fade-in slide-in-from-bottom-2 duration-700 [animation-delay:240ms] [animation-fill-mode:both]">
          <Button asChild size="lg" className="rounded-full px-6">
            <Link href="#demo">
              Try the demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-16 flex w-full animate-in fade-in flex-col items-center gap-4 duration-1000 [animation-delay:480ms] [animation-fill-mode:both]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
            Built for
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            {[
              "developers",
              "founders",
              "students",
              "writers",
              "home-lab operators",
              "personal CRMs",
            ].map((it, i) => (
              <li key={it} className="flex items-center gap-8">
                <span>{it}</span>
                {i < 5 && (
                  <span aria-hidden className="size-1 rounded-full bg-border" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
