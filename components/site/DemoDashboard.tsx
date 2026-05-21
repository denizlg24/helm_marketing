"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  PanelLeft,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ASSISTANT_TRANSCRIPT,
  CALENDAR_DAYS,
  CALENDAR_EVENTS,
  DEMO_MODULES,
  EMAILS,
  KANBAN,
  NOTES,
  PEOPLE,
  RESOURCES,
  type ModuleKey,
} from "@/lib/marketing";
import { CommandPalette } from "./CommandPalette";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { Reveal } from "./Reveal";

export function DemoDashboard() {
  const [enabled, setEnabled] = useState<Record<ModuleKey, boolean>>({
    notes: true,
    kanban: true,
    calendar: true,
    people: true,
    inbox: true,
    resources: true,
    assistant: true,
  });
  const [active, setActive] = useState<ModuleKey>("notes");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visible = useMemo(
    () => DEMO_MODULES.filter((m) => enabled[m.key]),
    [enabled]
  );

  const toggle = (k: ModuleKey) => {
    setEnabled((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      if (!next[k] && active === k) {
        const fallback = DEMO_MODULES.find((m) => next[m.key]);
        if (fallback) setActive(fallback.key);
      }
      return next;
    });
  };

  const goTo = (k: ModuleKey) => {
    if (!enabled[k]) setEnabled((p) => ({ ...p, [k]: true }));
    setActive(k);
  };

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24 md:py-32"
    >
      <Reveal>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          The bridge
        </p>
        <h2
          id="demo-heading"
          className="mt-3 max-w-3xl text-balance font-[var(--font-calistoga)] text-4xl leading-tight tracking-tight text-primary md:text-5xl"
        >
          A live console. Toggle modules.{" "}
          <em className="italic text-accent-strong/90">Watch the ship change.</em>
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Helm is a registry of modules. Disable one and it leaves the
          navigation, the command palette, the assistant&apos;s toolset — together.
        </p>
      </Reveal>

      <Reveal delay={120} y={20} className="mt-10 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-40px_rgba(48,54,48,0.35)]">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border/60 bg-secondary/40 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              aria-controls="demo-sidebar"
              className="inline-flex size-7 items-center justify-center rounded-md border border-border/70 bg-background/70 text-muted-foreground transition hover:border-border hover:text-foreground md:hidden"
            >
              <PanelLeft className="size-3.5" />
            </button>
            <div className="hidden items-center gap-1.5 md:flex">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-accent/80" />
              <span className="size-2.5 rounded-full bg-muted-foreground/40" />
            </div>
          </div>
          <span className="hidden text-[11px] tracking-wide text-muted-foreground sm:inline">
            helm://workspaces/solo
          </span>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-border hover:text-foreground"
            aria-label="Open command palette"
          >
            <span>Open palette</span>
            <kbd className="rounded border border-border/70 bg-secondary/60 px-1 font-mono text-[10px] leading-none">
              ⌘P
            </kbd>
          </button>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)]">
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 z-20 bg-primary/30 backdrop-blur-[2px] md:hidden"
            />
          )}
          {/* Sidebar */}
          <aside
            id="demo-sidebar"
            className={cn(
              "z-30 flex flex-col gap-5 bg-secondary/95 p-4 backdrop-blur md:static md:translate-x-0 md:border-r md:border-border/60 md:bg-secondary/30 md:backdrop-blur-0",
              "absolute inset-y-0 left-0 w-[260px] border-r border-border/60 shadow-xl transition-transform duration-200 ease-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            )}
          >
            <div className="flex items-center justify-between md:hidden">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                Navigation
              </p>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex size-7 items-center justify-center rounded-md border border-border/70 bg-background/70 text-muted-foreground transition hover:border-border hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div>
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                Workspace · Solo
              </p>
              <ul
                role="tablist"
                aria-label="Modules"
                aria-orientation="vertical"
                className="mt-2 space-y-0.5"
              >
                {visible.map((m) => {
                  const Icon = m.icon;
                  const isActive = active === m.key;
                  return (
                    <li key={m.key}>
                      <button
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        aria-controls={`panel-${m.key}`}
                        id={`tab-${m.key}`}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => {
                          setActive(m.key);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition",
                          isActive
                            ? "bg-card text-foreground shadow-sm"
                            : "text-foreground/80 hover:bg-card/70 hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-border/60 pt-4">
              <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                Module registry
              </p>
              <ul className="mt-2 space-y-0.5">
                {DEMO_MODULES.map((m) => (
                  <li
                    key={m.key}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-xs text-foreground">
                      <m.icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{m.label}</span>
                    </span>
                    <Switch
                      size="sm"
                      checked={enabled[m.key]}
                      onCheckedChange={() => toggle(m.key)}
                      aria-label={`Toggle ${m.label}`}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-3 px-1 text-[10.5px] leading-relaxed text-muted-foreground">
                Drives nav, palette, assistant tools, exports, billing.
              </p>
            </div>
          </aside>

          {/* Panel */}
          <div
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            className="min-h-[520px] bg-card p-5 md:py-7 md:pl-10 md:pr-7"
          >
            {active === "notes" && <NotesPanel />}
            {active === "kanban" && <KanbanPanel />}
            {active === "calendar" && <CalendarPanel />}
            {active === "people" && <PeoplePanel />}
            {active === "inbox" && <InboxPanel />}
            {active === "resources" && <ResourcesPanel />}
            {active === "assistant" && <AssistantPanel />}
          </div>
        </div>
      </Reveal>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Tip · press{" "}
        <kbd className="inline-flex items-center rounded border border-border/70 bg-background px-1 font-mono text-[10px]">
          ⌘P
        </kbd>{" "}
        anywhere to open the palette.
      </p>

      <p
        role="note"
        className="mx-auto mt-3 max-w-2xl text-balance text-center text-[11px] leading-relaxed text-muted-foreground/80"
      >
        This is an illustrative preview, not the live product. Layouts, copy,
        and data are mocked for presentation purposes — the shipping version
        may differ in surface and behaviour.
      </p>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={goTo}
      />
    </section>
  );
}

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h3 className="font-[var(--font-calistoga)] text-2xl tracking-tight text-primary">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function NotesPanel() {
  return (
    <div>
      <PanelHeader
        title="Notes"
        subtitle="4 notes · semantic graph synced 2m ago"
        action={
          <Badge variant="outline" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-accent" />
            Local embeddings
          </Badge>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <ul className="space-y-3 lg:col-span-7">
          {NOTES.map((n) => (
            <li
              key={n.title}
              className="group rounded-lg border border-border/60 bg-background p-4 transition hover:border-border"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-medium text-foreground">{n.title}</h4>
                <Badge variant="ghost" className="text-muted-foreground">
                  {n.tag}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {n.body}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {n.edges.map((e) => (
                  <span
                    key={e}
                    className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    ↬ {e}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="lg:col-span-5">
          <div className="h-[360px] overflow-hidden rounded-lg border border-border/60 bg-secondary/30">
            <KnowledgeGraph />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Embeddings run on your desktop. The cloud sees titles, not bodies.
          </p>
        </div>
      </div>
    </div>
  );
}

function KanbanPanel() {
  return (
    <div>
      <PanelHeader title="Tasks" subtitle="MVP push · 7 cards across 3 columns" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {KANBAN.map((col) => (
          <div
            key={col.column}
            className="rounded-lg border border-border/60 bg-secondary/30 p-2.5"
          >
            <div className="flex items-center justify-between px-1.5 pb-2">
              <p className="text-xs font-medium text-foreground">{col.column}</p>
              <span className="text-[11px] text-muted-foreground">
                {col.cards.length}
              </span>
            </div>
            <ul className="space-y-2">
              {col.cards.map((c) => (
                <li
                  key={c.title}
                  className="rounded-md border border-border/60 bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-snug text-foreground">
                      {c.title}
                    </p>
                    {c.prio === "high" && (
                      <span
                        aria-label="high priority"
                        className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive"
                      />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <Badge variant="ghost" className="px-1.5">
                      {c.tag}
                    </Badge>
                    {c.due && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {c.due}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPanel() {
  const hours = Array.from({ length: 10 }, (_, i) => 8 + i);
  const colors = {
    focus: "bg-primary text-primary-foreground",
    meet: "bg-accent text-accent-strong",
    personal: "bg-destructive/85 text-white",
  } as const;
  return (
    <div>
      <PanelHeader title="This week" subtitle="May 19 – 25 · 8 events" />
      <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
        <div className="bg-background" />
        {CALENDAR_DAYS.map((d, i) => (
          <div
            key={d}
            className="bg-background px-2 py-2 text-center text-[11px] text-muted-foreground"
          >
            {d}{" "}
            <span className="font-medium text-foreground">{i + 19}</span>
          </div>
        ))}
        <div className="bg-background">
          {hours.map((h) => (
            <div
              key={h}
              className="flex h-9 items-start justify-end pr-1.5 pt-0.5 text-[10px] text-muted-foreground"
            >
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>
        {Array.from({ length: 7 }).map((_, dayIdx) => (
          <div key={dayIdx} className="relative bg-background">
            {hours.map((_, i) => (
              <div key={i} className="h-9 border-b border-border/40" />
            ))}
            {CALENDAR_EVENTS.filter((e) => e.day === dayIdx).map((e, i) => (
              <div
                key={i}
                className={cn(
                  "absolute left-1 right-1 rounded-md px-1.5 py-1 text-[10.5px] leading-tight shadow-sm",
                  colors[e.kind],
                )}
                style={{
                  top: `${(e.start - 8) * 36 + 2}px`,
                  height: `${e.span * 36 - 4}px`,
                }}
              >
                {e.title}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <Legend swatch="bg-primary" label="Focus" />
        <Legend swatch="bg-accent" label="Meeting" />
        <Legend swatch="bg-destructive/85" label="Personal" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", swatch)} />
      {label}
    </span>
  );
}

function PeoplePanel() {
  return (
    <div>
      <PanelHeader title="People" subtitle="6 people · 3 follow-ups due" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PEOPLE.map((p, i) => (
          <article
            key={p.name}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3.5"
          >
            <div
              aria-hidden
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full text-xs font-medium",
                i % 2 === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-strong",
              )}
            >
              {p.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{p.name}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {p.role}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Last <span className="text-foreground">{p.last}</span> · Next{" "}
                <span className="text-foreground">{p.next}</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function InboxPanel() {
  return (
    <div>
      <PanelHeader
        title="Inbox"
        subtitle="3 of 124 · AI-triaged with suggestions"
        action={
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" /> Auto-triage
          </Badge>
        }
      />
      <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-background">
        {EMAILS.map((m) => (
          <li key={m.subject} className="grid gap-2 p-4 md:grid-cols-[1fr_220px]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-muted-foreground" />
                <p className="truncate text-sm">
                  <span className="font-medium text-foreground">{m.from}</span>{" "}
                  <span className="text-muted-foreground">· {m.address}</span>
                </p>
                <Badge variant="ghost" className="ml-auto text-muted-foreground">
                  {m.tag}
                </Badge>
              </div>
              <p className="mt-1 truncate font-medium text-foreground">
                {m.subject}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {m.snippet}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end md:justify-center">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Suggested
              </span>
              <Button size="sm" variant="outline" className="rounded-full">
                <Sparkles className="size-3.5" />
                {m.suggested}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResourcesPanel() {
  return (
    <div>
      <PanelHeader
        title="Fleet"
        subtitle="4 hosts · 1 warning · last check 14:02"
      />
      <div className="overflow-hidden rounded-lg border border-border/60">
        <table className="w-full border-collapse">
          <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Host</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">CPU</th>
              <th className="px-4 py-2 font-medium">RAM</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {RESOURCES.map((r) => (
              <tr key={r.name} className="border-t border-border/60 bg-background">
                <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
                <td className="px-4 py-3">
                  {r.status === "ok" ? (
                    <Badge className="gap-1 bg-accent text-accent-strong">
                      <CheckCircle2 className="size-3" /> Healthy
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <TriangleAlert className="size-3" /> Warning
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3"><Meter value={r.cpu} /></td>
                <td className="px-4 py-3"><Meter value={r.ram} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Meter({ value }: { value: number }) {
  const warn = value > 75;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-24 overflow-hidden rounded-full bg-border/70"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full", warn ? "bg-destructive" : "bg-primary")}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {value}%
      </span>
    </div>
  );
}

function AssistantPanel() {
  const [approved, setApproved] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <PanelHeader
          title="Assistant"
          subtitle="Workspace-aware operator · gpt-eq-1 · budget 78%"
        />
        <ul className="space-y-3">
          {ASSISTANT_TRANSCRIPT.map((m, i) => (
            <li
              key={i}
              className={cn(
                "rounded-lg p-3.5 text-sm leading-relaxed",
                m.who === "you"
                  ? "ml-10 bg-primary text-primary-foreground"
                  : "mr-10 border border-border/60 bg-background",
              )}
            >
              <p
                className={cn(
                  "mb-1 text-[10.5px] font-medium uppercase tracking-[0.16em]",
                  m.who === "you" ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {m.who === "you" ? "You" : "Helm"}
              </p>
              <p>{m.text}</p>
              {m.approval && (
                <div className="mt-3 flex flex-col gap-2 rounded-md border border-destructive/40 bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10.5px] font-medium uppercase tracking-wide text-destructive">
                      High-risk · approval required
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {m.approval.label}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setApproved(true)}
                      disabled={approved}
                    >
                      <Check className="size-3.5" />
                      {approved ? "Approved" : "Approve"}
                    </Button>
                    <Button size="sm" variant="outline">
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {approved && (
            <li className="mr-10 rounded-lg border border-border/60 bg-background p-3.5 text-sm">
              <p className="mb-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Helm
              </p>
              Sent. Logged to audit ·{" "}
              <span className="font-mono text-xs">evt_8C12A4</span>. Follow-up
              reminder set for Tuesday 09:00.
            </li>
          )}
        </ul>
      </div>
      <aside className="lg:col-span-4">
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-4">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tools · derived from enabled modules
          </p>
          <ul className="mt-3 space-y-1.5 font-mono text-xs text-foreground">
            {[
              ["notes.search", false],
              ["tasks.upsert", false],
              ["calendar.create", false],
              ["people.followup", false],
              ["email.send", true],
              ["resources.restart", true],
            ].map(([t, risky]) => (
              <li
                key={t as string}
                className="flex items-center justify-between rounded-md bg-background px-2.5 py-1.5"
              >
                <span className="text-foreground">→ {t as string}</span>
                {risky && (
                  <Badge
                    variant="outline"
                    className="border-destructive/40 text-[10px] text-destructive"
                  >
                    approval
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">
            Disable a module and its tools disappear from the registry before
            the next model request runs.
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-3 w-full justify-between"
          >
            Open settings
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      </aside>
    </div>
  );
}
