import { Reveal } from "./Reveal";
import {
  Activity,
  BookOpen,
  CalendarDays,
  FileText,
  Globe,
  Inbox,
  KanbanSquare,
  Lock,
  Network,
  Server,
  Sparkles,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";

type Item = { title: string; body: string; icon: LucideIcon };

const items: Item[] = [
  { title: "Notes", body: "Markdown notes with tags, groups, and URL capture.", icon: FileText },
  { title: "Knowledge graph", body: "Semantic edges and local embeddings from your desktop.", icon: Network },
  { title: "Tasks", body: "Kanban boards with priorities, due dates, and drag-reorder.", icon: KanbanSquare },
  { title: "Calendar", body: "Events, timetable, reminders, external sync hooks.", icon: CalendarDays },
  { title: "People", body: "Personal CRM with birthdays, follow-ups, relationship graph.", icon: Users },
  { title: "Inbox", body: "IMAP accounts with AI triage, categories, and suggestions.", icon: Inbox },
  { title: "Resources", body: "Servers, devices, APIs — uptime, metrics, safe commands.", icon: Server },
  { title: "Assistant", body: "Workspace-aware operator with module-derived tools.", icon: Sparkles },
  { title: "Pomodoro", body: "Local timer with session history and desktop notifications.", icon: Timer },
  { title: "Journal", body: "Entries connected to notes, events, and whiteboards.", icon: BookOpen },
  { title: "Security", body: "Scoped tokens, audit log, encrypted integration secrets.", icon: Lock },
  { title: "Publish (add-on)", body: "Optional public site. Isolated from private data.", icon: Globe },
];

export function Modules() {
  return (
    <section
      id="modules"
      aria-labelledby="modules-heading"
      className="border-t border-border/40 bg-secondary/30"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            Modules
          </p>
          <h2
            id="modules-heading"
            className="mt-3 text-balance font-[var(--font-calistoga)] text-4xl leading-tight tracking-tight text-primary md:text-5xl"
          >
            Twelve instruments.{" "}
            <em className="italic text-accent-strong/90">All optional.</em>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each module is registered, scoped, and billed independently. The
            registry decides what appears in your navigation, palette, tools, and bill.
          </p>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal
              as="li"
              key={it.title}
              delay={Math.min(i * 40, 320)}
              className="flex flex-col gap-3 bg-card p-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-md bg-secondary/70 text-accent-strong">
                  <it.icon className="size-4" />
                </span>
                <h3 className="font-medium text-foreground">{it.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {it.body}
              </p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Activity className="size-4 text-accent" />
          More modules are unlocked as Helm matures. You choose what to enable.
        </div>
      </div>
    </section>
  );
}
