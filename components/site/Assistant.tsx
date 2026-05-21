import { Check, ChevronRight, Lock, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./Reveal";

const tools = [
  { name: "notes.search(q)", desc: "Read · auto" },
  { name: "tasks.upsert(card)", desc: "Write · policy=open" },
  { name: "calendar.create(event)", desc: "Write · policy=ask" },
  { name: "people.followup(id)", desc: "Write · policy=open" },
  { name: "email.send(thread, draft)", desc: "Write · approval required", risky: true },
  { name: "resources.restart(host, svc)", desc: "Write · approval required", risky: true },
];

const gates = [
  "Workspace membership",
  "Module enabled",
  "Role permission",
  "Token scope",
  "Entitlement (Pro · AI budget 78%)",
  "Approval policy",
];

export function Assistant() {
  return (
    <section
      id="assistant"
      aria-labelledby="assistant-heading"
      className="border-t border-border/40 bg-secondary/30"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-12 md:py-32">
        <Reveal className="lg:col-span-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            The assistant
          </p>
          <h2
            id="assistant-heading"
            className="mt-3 text-balance font-[var(--font-calistoga)] text-4xl leading-tight tracking-tight text-primary md:text-5xl"
          >
            Not a chatbot.{" "}
            <em className="italic text-accent-strong/90">An operator with a permission slip.</em>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Helm&apos;s assistant inherits its toolset from the modules you have
            enabled, the role you hold, the scopes on your token, and your
            workspace&apos;s approval policy — checked <em>before</em> every
            model request, not after.
          </p>

          <dl className="mt-8 space-y-5">
            {[
              ["Read tools", "Search notes, calendar, people, emails, resources — run immediately."],
              ["Write tools", "Create and update entities — held under your approval policy."],
              ["High-risk tools", "Send mail, delete data, reboot a server — always require explicit confirmation."],
              ["Every call", "Audited, budgeted, and reversible where reversible."],
            ].map(([t, b]) => (
              <div key={t} className="grid grid-cols-[120px_1fr] gap-4 border-t border-border/60 pt-4">
                <dt className="text-sm font-medium text-foreground">{t}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{b}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 bg-secondary/50 px-4 py-2">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-accent-strong" />
                resolved at request time
              </p>
              <Badge variant="ghost" className="font-mono text-[10px]">
                workspace · solo
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-border/60">
              <div className="p-5">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Tools
                </p>
                <ul className="mt-3 space-y-1.5">
                  {tools.map((t) => (
                    <li
                      key={t.name}
                      className="rounded-md border border-border/60 bg-background px-2.5 py-1.5"
                    >
                      <p className="font-mono text-xs text-foreground">
                        {t.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                        {t.risky ? (
                          <TriangleAlert className="size-3 text-destructive" />
                        ) : (
                          <Check className="size-3 text-accent-strong" />
                        )}
                        {t.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Gates · in order
                </p>
                <ul className="mt-3 space-y-2">
                  {gates.map((g) => (
                    <li
                      key={g}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Lock className="size-3.5 text-accent-strong" />
                      {g}
                      <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-md border border-accent/30 bg-accent/10 p-3 text-[11px] text-foreground">
                  Tools are derived from <em>your</em> registry. Disable a module
                  and its tools disappear from the next request — before any
                  token spend.
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
