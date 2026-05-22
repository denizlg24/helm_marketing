import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FileText,
  Inbox,
  KanbanSquare,
  Network,
  Server,
  Sparkles,
  Users,
  Microscope,
  Code2,
  Rocket,
  Feather,
} from "lucide-react";
import type {
  INote,
  INoteEdge,
  INoteGroup,
} from "@/lib/data-types";

export type ModuleKey =
  | "notes"
  | "kanban"
  | "calendar"
  | "people"
  | "inbox"
  | "resources"
  | "assistant";

export type DemoModule = {
  key: ModuleKey;
  label: string;
  hint: string;
  icon: LucideIcon;
};

export const DEMO_MODULES: DemoModule[] = [
  { key: "notes", label: "Notes", hint: "Knowledge + graph", icon: FileText },
  { key: "kanban", label: "Tasks", hint: "Boards & priorities", icon: KanbanSquare },
  { key: "calendar", label: "Calendar", hint: "Week & timetable", icon: CalendarDays },
  { key: "people", label: "People", hint: "Personal CRM", icon: Users },
  { key: "inbox", label: "Inbox", hint: "IMAP + AI triage", icon: Inbox },
  { key: "resources", label: "Resources", hint: "Servers & health", icon: Server },
  { key: "assistant", label: "Assistant", hint: "AI operator", icon: Sparkles },
];

export type PersonaKey = "researcher" | "founder" | "developer" | "writer";

export type Persona = {
  key: PersonaKey;
  label: string;
  blurb: string;
  icon: LucideIcon;
};

export const PERSONAS: Persona[] = [
  { key: "researcher", label: "Researcher", blurb: "Papers, experiments, advisors.", icon: Microscope },
  { key: "founder", label: "Founder", blurb: "Hiring, fundraising, customers.", icon: Rocket },
  { key: "developer", label: "Developer", blurb: "Code, incidents, on-call.", icon: Code2 },
  { key: "writer", label: "Writer", blurb: "Drafts, edits, deadlines.", icon: Feather },
];

export type KanbanSeed = {
  column: string;
  cards: { title: string; tag: string; prio: "low" | "med" | "high"; due?: string }[];
}[];

export type CalendarEventSeed = {
  day: number;
  start: number;
  span: number;
  title: string;
  kind: "focus" | "meet" | "personal";
};

export type PersonSeed = { name: string; role: string; last: string; next: string };

export type EmailSeed = {
  from: string;
  address: string;
  subject: string;
  snippet: string;
  tag: string;
  suggested: string;
};

export type ResourceSeed = {
  name: string;
  role: string;
  status: "ok" | "warn";
  cpu: number;
  ram: number;
};

export type AssistantMessageSeed = {
  who: "you" | "helm";
  text: string;
  approval?: { label: string; risk: "low" | "med" | "high" };
};

export type PersonaSeed = {
  key: PersonaKey;
  tagline: string;
  groups: INoteGroup[];
  notes: INote[];
  edges: INoteEdge[];
  kanban: KanbanSeed;
  calendarEvents: CalendarEventSeed[];
  people: PersonSeed[];
  emails: EmailSeed[];
  personalEmails: (EmailSeed & { received?: string })[];
  resources: ResourceSeed[];
  assistantTranscript: AssistantMessageSeed[];
  assistantTools: string[];
};

const seedNow = "2026-05-22T08:30:00.000Z";

function mkGroup(
  id: string,
  name: string,
  parentId: string | null,
  color: string,
): INoteGroup {
  return {
    _id: id,
    name,
    parentId,
    color,
    autoCreated: false,
    kind: "manual",
    source: "user",
    createdAt: seedNow,
    updatedAt: seedNow,
  };
}

function mkNote(args: {
  id: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  groupIds: string[];
  className: string;
}): INote {
  return {
    _id: args.id,
    title: args.title,
    content: args.content,
    description: args.description,
    tags: args.tags,
    groupIds: args.groupIds,
    class: args.className,
    status: "open",
    createdAt: seedNow,
    updatedAt: seedNow,
  };
}

function mkEdge(id: string, from: string, to: string, strength: number): INoteEdge {
  return {
    _id: id,
    from,
    to,
    strength,
    source: "manual",
    createdAt: seedNow,
    updatedAt: seedNow,
  };
}

// ---------- FOUNDER (existing dogfood data) ----------

const founderGroups: INoteGroup[] = [
  mkGroup("g-infra", "Infrastructure", null, "#647560"),
  mkGroup("g-local", "Local-first", "g-infra", "#a1bc98"),
  mkGroup("g-ops", "Operations", "g-infra", "#d4a373"),
  mkGroup("g-research", "Research", null, "#9cc5c9"),
  mkGroup("g-writing", "Writing", null, "#c9b8d4"),
];

const founderNotes: INote[] = [
  mkNote({
    id: "f-n-1",
    title: "Local embeddings rollout",
    content: `# Local embeddings rollout

Helm keeps note bodies local and only ships metadata when a remote model needs context.

## Decisions

- Use the desktop worker for embedding generation.
- Cache vectors by content hash.
- Keep semantic grouping as an explicit action.

## Open questions

Should stale notes appear in the graph as dimmed nodes or a separate queue?`,
    description:
      "Plan for local embeddings, cache invalidation, and the visible states in the graph.",
    tags: ["privacy", "embeddings", "desktop"],
    groupIds: ["g-local", "g-research"],
    className: "plan",
  }),
  mkNote({
    id: "f-n-2",
    title: "Email triage failure modes",
    content: `# Email triage failure modes

The assistant can draft actions, but high-risk work stays behind approval.

| Risk | Guardrail |
| --- | --- |
| Wrong recipient | Show account and recipient before send |
| Calendar conflict | Preview target slot |
| Task spam | Merge similar task suggestions |

Related to the module registry because disabled modules remove their tools.`,
    tags: ["triage", "assistant"],
    groupIds: ["g-ops"],
    className: "memo",
  }),
  mkNote({
    id: "f-n-3",
    title: "Markdown renderer checklist",
    content: `# Markdown renderer checklist

- [x] Tables
- [x] Code highlighting
- [x] Math blocks
- [ ] PDF parity

\`\`\`ts
const preview = renderMarkdown(note.content);
\`\`\`

Inline math works too: $a^2 + b^2 = c^2$.`,
    tags: ["markdown", "editor"],
    groupIds: ["g-writing", "g-local"],
    className: "checklist",
  }),
  mkNote({
    id: "f-n-4",
    title: "Tauri window polish",
    content: `# Tauri window polish

Small desktop affordances that make the app feel native:

1. Title bar actions match the OS target.
2. Downloads remember the last folder.
3. External links open outside the webview.

The marketing demo should show the real editing surface instead of a static card.`,
    tags: ["desktop", "ux"],
    groupIds: ["g-local"],
    className: "implementation",
  }),
  mkNote({
    id: "f-n-5",
    title: "Module registry contract",
    content: `# Module registry contract

Every enabled module contributes:

- navigation entries
- command palette actions
- assistant tools
- billing scope

Disabling a module should remove the entire surface before the next model request.`,
    tags: ["modules", "assistant"],
    groupIds: ["g-ops", "g-research"],
    className: "architecture",
  }),
];

const founderEdges: INoteEdge[] = [
  mkEdge("f-e-1", "f-n-1", "f-n-3", 0.82),
  mkEdge("f-e-2", "f-n-1", "f-n-4", 0.72),
  mkEdge("f-e-3", "f-n-2", "f-n-5", 0.8),
  mkEdge("f-e-4", "f-n-3", "f-n-4", 0.66),
  mkEdge("f-e-5", "f-n-1", "f-n-5", 0.64),
];

// ---------- RESEARCHER ----------

const researcherGroups: INoteGroup[] = [
  mkGroup("g-ml", "Machine learning", null, "#9cc5c9"),
  mkGroup("g-moe", "Sparse MoE", "g-ml", "#7fb3b8"),
  mkGroup("g-eval", "Evaluation", "g-ml", "#a1bc98"),
  mkGroup("g-lab", "Lab", null, "#c9b8d4"),
  mkGroup("g-writing", "Drafts", null, "#d4a373"),
];

const researcherNotes: INote[] = [
  mkNote({
    id: "r-n-1",
    title: "Sparse MoE — failure modes",
    content: `# Sparse MoE — failure modes

Logging from runs 142–158 shows three recurring failure modes:

1. **Router collapse** — one expert absorbs >70% of tokens after ~4k steps.
2. **Load-balance loss drift** — coefficient too low; raise from 0.01 → 0.05.
3. **Eval contamination** — held-out set overlaps with C4-research-v3.

> Open: does router temperature annealing help, or just delay collapse?

\`\`\`python
loss = task_loss + 0.05 * load_balance_loss(router)
\`\`\``,
    description: "Pattern analysis from this week's training runs.",
    tags: ["moe", "training", "failure-modes"],
    groupIds: ["g-moe", "g-ml"],
    className: "analysis",
  }),
  mkNote({
    id: "r-n-2",
    title: "Lit review — causal probes",
    content: `# Lit review — causal probes

| Paper | Method | Verdict |
| --- | --- | --- |
| Geiger '24 | Distributed alignment | Strong baseline |
| Chen '26 | Linear probes + causal mediation | Useful for our setup |
| Lin '26 | Sparse routing decomposition | Cite in §2 |

Pull the Chen et al. notation for the mediation diagram.`,
    tags: ["lit-review", "causal", "probes"],
    groupIds: ["g-ml"],
    className: "review",
  }),
  mkNote({
    id: "r-n-3",
    title: "Methods §3 — draft v3",
    content: `# Methods §3 — draft v3

We train a 1.3B-param decoder with 8 experts per layer.

- Dataset: C4-research-v3 (deduped, filtered for PII).
- Optimizer: AdamW, lr=3e-4, cosine decay over 80k steps.
- Eval: HumanEval, GSM8K, plus our internal contamination-screened benchmark.

Diana flagged: spell out why we chose top-2 routing over top-k>2.`,
    tags: ["methods", "draft", "paper"],
    groupIds: ["g-writing", "g-moe"],
    className: "draft",
  }),
  mkNote({
    id: "r-n-4",
    title: "Reading group — Lin et al. notes",
    content: `# Reading group — Lin et al.

Main claim: sparsity-aware routing cuts FLOPs ~38% with negligible accuracy loss.

**Weakness:** eval set includes 11% of their own pretraining mixture (we checked with MinHash).

Action: ask area chair whether this disqualifies their main table.`,
    tags: ["reading-group", "moe", "review"],
    groupIds: ["g-ml", "g-eval"],
    className: "memo",
  }),
  mkNote({
    id: "r-n-5",
    title: "Advisor meeting — Diana, Wed",
    content: `# Advisor meeting — Diana, Wed

Agenda:

- Walk through ablation results from layers 2/4/8.
- Discuss whether we want to submit to NeurIPS or wait for ICLR.
- Ask about reviewer slot — area chair offered.

Notes from last meeting: she wants the contamination check to be in §4, not appendix.`,
    tags: ["meeting", "advisor"],
    groupIds: ["g-lab"],
    className: "meeting",
  }),
];

const researcherEdges: INoteEdge[] = [
  mkEdge("r-e-1", "r-n-1", "r-n-3", 0.85),
  mkEdge("r-e-2", "r-n-2", "r-n-3", 0.7),
  mkEdge("r-e-3", "r-n-4", "r-n-1", 0.78),
  mkEdge("r-e-4", "r-n-5", "r-n-3", 0.6),
  mkEdge("r-e-5", "r-n-2", "r-n-4", 0.66),
];

// ---------- DEVELOPER ----------

const developerGroups: INoteGroup[] = [
  mkGroup("g-platform", "Platform", null, "#647560"),
  mkGroup("g-api", "API", "g-platform", "#a1bc98"),
  mkGroup("g-data", "Data", "g-platform", "#7fb3b8"),
  mkGroup("g-incidents", "Incidents", null, "#d96b6b"),
  mkGroup("g-rfcs", "RFCs", null, "#c9b8d4"),
];

const developerNotes: INote[] = [
  mkNote({
    id: "d-n-1",
    title: "RFC-014 — query layer refactor",
    content: `# RFC-014 — query layer refactor

## Problem
Controllers reach directly into ORM with ad-hoc joins. /api/search hits a full scan on \`notes_fts\` for any user with >2k notes.

## Proposal
Lift queries into a thin \`NoteRepository\` that owns the SQL. Add a composite index \`(user_id, updated_at DESC)\`.

\`\`\`sql
CREATE INDEX CONCURRENTLY notes_user_updated_idx
  ON notes (user_id, updated_at DESC);
\`\`\`

## Cost
~140ms p95 → ~22ms p95 on staging.`,
    description: "Lift the query layer out of controllers, add composite index.",
    tags: ["rfc", "performance", "postgres"],
    groupIds: ["g-rfcs", "g-api", "g-data"],
    className: "rfc",
  }),
  mkNote({
    id: "d-n-2",
    title: "P1 May-12 — postmortem",
    content: `# P1 May-12 — postmortem

**TL;DR:** NATS consumer fell behind during a webhook spike. Search index lag hit 14 minutes before auto-recovery.

## Timeline (UTC)
- 02:47 — webhook spike from Acme bulk import (~12k events/min)
- 02:51 — consumer lag breaches 5m SLO, pages on-call
- 03:07 — Kai scales consumer pool 3 → 8
- 03:14 — incident resolved, lag back below SLO

## Action items
- Pre-scale consumer pool ahead of known bulk imports.
- Add per-tenant rate limit on webhook ingress.`,
    tags: ["incident", "postmortem", "nats"],
    groupIds: ["g-incidents"],
    className: "postmortem",
  }),
  mkNote({
    id: "d-n-3",
    title: "Spike — switch broker to NATS?",
    content: `# Spike — switch broker to NATS?

Currently on Redis Streams.

| Axis | Redis Streams | NATS JetStream |
| --- | --- | --- |
| Throughput | ~40k/s | ~120k/s |
| Op overhead | low | medium |
| Replay | bounded | strong |
| Cost | free w/ existing Redis | dedicated cluster |

Recommendation: defer. Redis Streams meets current load; revisit at 4× scale.`,
    tags: ["spike", "infra", "messaging"],
    groupIds: ["g-platform"],
    className: "spike",
  }),
  mkNote({
    id: "d-n-4",
    title: "TIL — pg_stat_statements wins",
    content: `# TIL — pg_stat_statements wins

\`\`\`sql
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
\`\`\`

Found a sneaky N+1 on \`/api/people/recent\` — 2.4k queries per page load. Fixed with a single \`IN\` clause + index hint.`,
    tags: ["til", "postgres", "performance"],
    groupIds: ["g-data"],
    className: "til",
  }),
  mkNote({
    id: "d-n-5",
    title: "Auth v2 migration plan",
    content: `# Auth v2 migration plan

Three-phase cutover:

1. **Dual-write** — sessions land in both v1 and v2 stores.
2. **Read shadow** — compare v2 reads against v1 for 7 days.
3. **Flip** — flag-gated; ramp 1% → 10% → 100% over a week.

Rollback: kill switch routes all reads back to v1 in <30s.`,
    tags: ["auth", "migration", "rollout"],
    groupIds: ["g-api", "g-rfcs"],
    className: "plan",
  }),
];

const developerEdges: INoteEdge[] = [
  mkEdge("d-e-1", "d-n-1", "d-n-4", 0.82),
  mkEdge("d-e-2", "d-n-2", "d-n-3", 0.72),
  mkEdge("d-e-3", "d-n-1", "d-n-5", 0.66),
  mkEdge("d-e-4", "d-n-2", "d-n-1", 0.7),
  mkEdge("d-e-5", "d-n-3", "d-n-5", 0.6),
];

// ---------- WRITER ----------

const writerGroups: INoteGroup[] = [
  mkGroup("g-novel", "Novel — The Return", null, "#c9b8d4"),
  mkGroup("g-characters", "Characters", "g-novel", "#a8a4d9"),
  mkGroup("g-chapters", "Chapters", "g-novel", "#d4a373"),
  mkGroup("g-essays", "Essays", null, "#9cc5c9"),
  mkGroup("g-newsletter", "Newsletter", null, "#a1bc98"),
];

const writerNotes: INote[] = [
  mkNote({
    id: "w-n-1",
    title: "Character bible — Mira",
    content: `# Mira

**Age:** 34. **Origin:** coastal town, eldest of three.

## Voice
Clipped sentences when defensive; rambling when comfortable. Never uses the word "actually."

## Wants vs. needs
- *Wants*: to be left alone.
- *Needs*: to be seen, by exactly one person.

## Arc
Ch. 1–6: refuses the return. Ch. 7: returns. Ch. 8–12: the cost.`,
    description: "Voice, wants, needs, arc.",
    tags: ["character", "novel"],
    groupIds: ["g-characters", "g-novel"],
    className: "bible",
  }),
  mkNote({
    id: "w-n-2",
    title: "Ch. 7 — the return",
    content: `# Ch. 7 — the return

The pivotal scene. Mira walks back into the house she left at 18.

## Beats
1. The drive — quiet, no music. (cold open)
2. The door — unlocked. *She* didn't lock it.
3. The kitchen — the wallpaper still peeling at the same corner.
4. The voice from upstairs.

Land on the voice. Cut the chapter there.`,
    tags: ["chapter", "novel", "draft"],
    groupIds: ["g-chapters", "g-novel"],
    className: "draft",
  }),
  mkNote({
    id: "w-n-3",
    title: "Essay — the cost of clarity",
    content: `# The cost of clarity

> "The price of clarity is the loss of nuance, and the price of nuance is the loss of an audience."

Draft thesis: every sentence that earns its place pays for itself twice — once in meaning, once in what it had to abandon to be said.

Examples to pull:
- Didion on the empty notebook.
- Berger's "ways of seeing."
- That paragraph from Le Guin's introduction.`,
    tags: ["essay", "draft"],
    groupIds: ["g-essays"],
    className: "essay",
  }),
  mkNote({
    id: "w-n-4",
    title: "Newsletter — April issue",
    content: `# Newsletter — April issue

**Subject:** What I gave up to finish chapter six

## Sections
- Personal: the week of the deadline.
- Read this: Lin's translation of Catullus.
- Listening to: the Eno reissue.

Send Thursday 09:00 local. Audience: 2.4k readers.`,
    tags: ["newsletter"],
    groupIds: ["g-newsletter"],
    className: "newsletter",
  }),
  mkNote({
    id: "w-n-5",
    title: "Editor feedback — round 2",
    content: `# Editor feedback — round 2

Maya's notes on chapters 4–6:

- **Pacing in ch. 5**: scene at the harbor runs long. Cut ~400 words.
- **Mira's voice**: drifts into the narrator's voice on p. 73 and p. 81.
- **Strong**: the dinner scene. Keep verbatim.

Reply by Wednesday with the revision plan.`,
    tags: ["edits", "feedback"],
    groupIds: ["g-novel"],
    className: "edits",
  }),
];

const writerEdges: INoteEdge[] = [
  mkEdge("w-e-1", "w-n-1", "w-n-2", 0.88),
  mkEdge("w-e-2", "w-n-2", "w-n-5", 0.74),
  mkEdge("w-e-3", "w-n-3", "w-n-4", 0.7),
  mkEdge("w-e-4", "w-n-1", "w-n-5", 0.65),
  mkEdge("w-e-5", "w-n-2", "w-n-3", 0.58),
];

// ---------- KANBAN / CALENDAR / PEOPLE / EMAIL / RESOURCES / ASSISTANT ----------

const founderKanban: KanbanSeed = [
  {
    column: "Backlog",
    cards: [
      { title: "Pin Next.js 16 LTS in web app", tag: "infra", prio: "low" },
      { title: "Workspace template — Founder", tag: "onboarding", prio: "med" },
      { title: "Approval policy schema", tag: "assistant", due: "Fri", prio: "high" },
    ],
  },
  {
    column: "In progress",
    cards: [
      { title: "Module registry → palette wiring", tag: "core", due: "Today", prio: "high" },
      { title: "Audit log writer", tag: "security", prio: "med" },
    ],
  },
  {
    column: "Done",
    cards: [
      { title: "Stripe webhooks → entitlements", tag: "billing", prio: "high" },
      { title: "Desktop device-code activation", tag: "desktop", prio: "med" },
    ],
  },
];

const researcherKanban: KanbanSeed = [
  {
    column: "Backlog",
    cards: [
      { title: "Run ablation on layer 4", tag: "experiments", prio: "high", due: "Today" },
      { title: "Re-check eval set for contamination", tag: "eval", prio: "high", due: "Wed" },
      { title: "Replicate Chen et al. baseline", tag: "lit", prio: "med" },
    ],
  },
  {
    column: "In progress",
    cards: [
      { title: "Methods §3 — draft v3", tag: "paper", due: "Fri", prio: "high" },
      { title: "Pull GPU profiling traces", tag: "infra", prio: "med" },
    ],
  },
  {
    column: "Done",
    cards: [
      { title: "Reading group prep — Lin et al.", tag: "lit", prio: "med" },
      { title: "Book reviewer slot — NeurIPS", tag: "service", prio: "low" },
    ],
  },
];

const developerKanban: KanbanSeed = [
  {
    column: "Backlog",
    cards: [
      { title: "Bump Next 16.2 → 16.3", tag: "deps", prio: "low" },
      { title: "Triage 3 GH issues", tag: "issues", prio: "med" },
      { title: "Patch CVE-2026-1129 (lodash)", tag: "security", prio: "high", due: "Today" },
    ],
  },
  {
    column: "In progress",
    cards: [
      { title: "PR #482 — search index", tag: "perf", due: "Today", prio: "high" },
      { title: "Auth v2 — dual-write rollout", tag: "auth", prio: "high", due: "Thu" },
    ],
  },
  {
    column: "Done",
    cards: [
      { title: "Add tracing to /api/search", tag: "obs", prio: "med" },
      { title: "P1 May-12 — postmortem", tag: "incident", prio: "high" },
    ],
  },
];

const writerKanban: KanbanSeed = [
  {
    column: "Backlog",
    cards: [
      { title: "Outline ch. 7 — pivotal scene", tag: "novel", prio: "high", due: "Today" },
      { title: "Schedule bookstore reading", tag: "events", prio: "med", due: "Fri" },
      { title: "Reply to 12 reader letters", tag: "newsletter", prio: "low" },
    ],
  },
  {
    column: "In progress",
    cards: [
      { title: "1500 words today", tag: "novel", due: "Today", prio: "high" },
      { title: "Revise ch. 5 pacing per Maya", tag: "edits", prio: "high", due: "Wed" },
    ],
  },
  {
    column: "Done",
    cards: [
      { title: "Confirm cover artist quote", tag: "production", prio: "med" },
      { title: "Send April newsletter", tag: "newsletter", prio: "med" },
    ],
  },
];

const founderCalendar: CalendarEventSeed[] = [
  { day: 0, start: 9, span: 2, title: "Deep work — registry", kind: "focus" },
  { day: 0, start: 14, span: 1, title: "Tauri review", kind: "meet" },
  { day: 1, start: 10, span: 3, title: "MVP planning", kind: "focus" },
  { day: 2, start: 9, span: 1, title: "Standup", kind: "meet" },
  { day: 2, start: 11, span: 2, title: "Inbox triage design", kind: "focus" },
  { day: 3, start: 15, span: 2, title: "Investor — Lighthouse", kind: "meet" },
  { day: 4, start: 9, span: 4, title: "Ship MVP candidate", kind: "focus" },
  { day: 5, start: 11, span: 1, title: "Birthday · Ana", kind: "personal" },
];

const researcherCalendar: CalendarEventSeed[] = [
  { day: 0, start: 9, span: 1, title: "Lab meeting", kind: "meet" },
  { day: 0, start: 11, span: 1, title: "Reading group — Lin et al.", kind: "meet" },
  { day: 1, start: 9, span: 3, title: "Methods §3 — writing block", kind: "focus" },
  { day: 1, start: 14, span: 1, title: "Office hours", kind: "meet" },
  { day: 2, start: 10, span: 2, title: "Advisor — Diana", kind: "meet" },
  { day: 2, start: 16, span: 2, title: "GPU window (4×A100)", kind: "focus" },
  { day: 3, start: 9, span: 3, title: "Rebuttal draft", kind: "focus" },
  { day: 4, start: 14, span: 2, title: "Coffee — Hugo (MILA)", kind: "personal" },
];

const developerCalendar: CalendarEventSeed[] = [
  { day: 0, start: 9, span: 1, title: "Standup", kind: "meet" },
  { day: 0, start: 10, span: 2, title: "Pairing — Sam (RFC-014)", kind: "focus" },
  { day: 0, start: 13, span: 1, title: "Architecture review", kind: "meet" },
  { day: 1, start: 9, span: 3, title: "Deep work — auth migration", kind: "focus" },
  { day: 2, start: 9, span: 1, title: "Standup", kind: "meet" },
  { day: 2, start: 16, span: 1, title: "On-call handoff", kind: "meet" },
  { day: 3, start: 10, span: 4, title: "Ship PR #482", kind: "focus" },
  { day: 4, start: 17, span: 1, title: "OSS office hours", kind: "personal" },
];

const writerCalendar: CalendarEventSeed[] = [
  { day: 0, start: 8, span: 3, title: "Writing block — deep", kind: "focus" },
  { day: 0, start: 14, span: 1, title: "Podcast taping", kind: "meet" },
  { day: 1, start: 8, span: 3, title: "Writing block — deep", kind: "focus" },
  { day: 1, start: 12, span: 1, title: "Lunch — Theo (agent)", kind: "meet" },
  { day: 2, start: 8, span: 3, title: "Revise ch. 5", kind: "focus" },
  { day: 3, start: 17, span: 1, title: "Bookstore reading — Atlas", kind: "personal" },
  { day: 4, start: 9, span: 4, title: "1500-word target", kind: "focus" },
  { day: 5, start: 19, span: 2, title: "Workshop critique circle", kind: "personal" },
];

const founderPeople: PersonSeed[] = [
  { name: "Ana Brandão", role: "co-founder", last: "2d", next: "Birthday · Sat" },
  { name: "Marius Holm", role: "design partner", last: "5d", next: "Send draft" },
  { name: "Sofia Patel", role: "investor", last: "11d", next: "Follow-up" },
  { name: "Jonas Weber", role: "engineer", last: "1mo", next: "Reintroduce" },
  { name: "Lin Yu", role: "writer", last: "3w", next: "Trade essay" },
  { name: "Kemi Adeyemi", role: "ops lead", last: "today", next: "Approve TOS" },
];

const researcherPeople: PersonSeed[] = [
  { name: "Diana Krause", role: "advisor", last: "today", next: "Wed meeting" },
  { name: "Hugo Vasquez", role: "collab @ MILA", last: "3d", next: "Coffee Fri" },
  { name: "Lin Zhao", role: "co-first author", last: "1d", next: "Review §3" },
  { name: "Priya Sharma", role: "lab manager", last: "1w", next: "GPU window" },
  { name: "Marcus Chen", role: "PhD cohort", last: "2w", next: "Reading group" },
  { name: "Reviewer #2", role: "anonymous, area chair", last: "—", next: "Rebuttal" },
];

const developerPeople: PersonSeed[] = [
  { name: "Sam Chen", role: "staff eng", last: "today", next: "Pair on RFC-014" },
  { name: "Kai Rivera", role: "SRE on-call", last: "1d", next: "Handoff Wed" },
  { name: "Mei Wang", role: "eng manager", last: "2d", next: "1:1 Thu" },
  { name: "Riley Park", role: "customer success", last: "4d", next: "Escalation review" },
  { name: "fxn", role: "OSS maintainer", last: "1w", next: "Review PR" },
  { name: "Jordan Reid", role: "platform eng", last: "2w", next: "Onboarding chat" },
];

const writerPeople: PersonSeed[] = [
  { name: "Maya Ruiz", role: "editor", last: "1d", next: "Revision plan Wed" },
  { name: "Theo Hart", role: "agent", last: "3d", next: "Lunch Tue" },
  { name: "Júlia Okafor", role: "cover artist", last: "1w", next: "Approve proof" },
  { name: "Sam Delgado", role: "writing group", last: "2w", next: "Workshop Fri" },
  { name: "Anya Pereira", role: "newsletter reader", last: "—", next: "Reply letter" },
  { name: "Lucas Mendes", role: "podcast host", last: "today", next: "Send bio" },
];

const founderEmails: EmailSeed[] = [
  {
    from: "Sofia Patel",
    address: "sofia@lighthouse.vc",
    subject: "Quick follow-up after demo",
    snippet:
      "Loved the bridge metaphor. Could we see the assistant tool registry next week? Open to any time Tue–Thu.",
    tag: "investor",
    suggested: "Reply · schedule Tue 15:00",
  },
  {
    from: "Marius Holm",
    address: "marius@studio.co",
    subject: "Design draft v3",
    snippet:
      "Pushed v3 to Figma. Tightened the empty states and the approval banner. Not urgent.",
    tag: "design",
    suggested: "Create task · review by Thu",
  },
  {
    from: "Linear",
    address: "notify@linear.app",
    subject: "5 issues assigned this week",
    snippet:
      "Helm/MVP — auth-flow, billing-edge-case, palette-shortcuts, audit-write, deletion-cleanup.",
    tag: "automation",
    suggested: "Archive",
  },
];

const researcherEmails: EmailSeed[] = [
  {
    from: "NeurIPS Area Chair",
    address: "ac-218@neurips.cc",
    subject: "Rebuttal due Fri 23:59 AoE",
    snippet:
      "Reviewers raised concerns about eval set contamination. Please address R2's specific question on §4.2 before submission close.",
    tag: "review",
    suggested: "Draft rebuttal · use §4.2 contamination check",
  },
  {
    from: "HuggingFace",
    address: "datasets@hf.co",
    subject: "Dataset access granted — c4-research-v3",
    snippet:
      "Your access request was approved. Snapshot synced to your org bucket. Quota: 2TB/month egress.",
    tag: "automation",
    suggested: "Add to notes · dataset access",
  },
  {
    from: "Lin Zhao",
    address: "lin.z@uni.edu",
    subject: "Edits attached — methods.tex",
    snippet:
      "Tightened §3.2 per Diana's note. Please re-check the loss term — I think we want \\lambda=0.05 not 0.01.",
    tag: "collab",
    suggested: "Reply · open methods.tex",
  },
];

const developerEmails: EmailSeed[] = [
  {
    from: "GitHub Actions",
    address: "noreply@github.com",
    subject: "Build failed: main #2104",
    snippet:
      "FAIL apps/web/test/search.spec.ts — 2 of 184 tests failed. Re-run requested? Top failure: timeout on /api/search.",
    tag: "ci",
    suggested: "Open run · re-run flaky tests",
  },
  {
    from: "PagerDuty",
    address: "alerts@pagerduty.com",
    subject: "Resolved: api latency p99",
    snippet:
      "Incident #4419 resolved at 03:14 UTC. Duration 17m. Root cause: NATS consumer lag. Postmortem due Friday.",
    tag: "incident",
    suggested: "Create task · postmortem due Fri",
  },
  {
    from: "Sam Chen",
    address: "sam@helm.local",
    subject: "PR review requested — #482",
    snippet:
      "Pulled the query layer into a thin repo module per RFC-014. Added the composite index in a separate migration so you can roll it back independently.",
    tag: "review",
    suggested: "Review PR · open in editor",
  },
];

const writerEmails: EmailSeed[] = [
  {
    from: "Maya Ruiz",
    address: "maya@penguin.co",
    subject: "Edit pass — chapters 4–6",
    snippet:
      "Track changes in the doc. Biggest note is on pacing in ch. 5 — the harbor scene runs about 400 words long. Otherwise really strong, especially the dinner.",
    tag: "edits",
    suggested: "Open doc · plan revision",
  },
  {
    from: "Hay Festival",
    address: "programming@hayfestival.org",
    subject: "Speaking invite — June panel",
    snippet:
      "We'd love to have you on the 'craft & constraint' panel alongside Lin Yu and Marcus Cole. June 7, 3:30pm. Honorarium attached.",
    tag: "event",
    suggested: "Reply · confirm availability",
  },
  {
    from: "Penguin Royalties",
    address: "royalties@penguin.co",
    subject: "Q1 statement attached",
    snippet:
      "Net royalties this period: $4,182.40. Statement and breakdown by territory in the attached PDF. Payment processed.",
    tag: "automation",
    suggested: "Archive",
  },
];

const founderPersonalEmails: (EmailSeed & { received?: string })[] = [
  {
    from: "Ana Brandao",
    address: "ana@example.com",
    subject: "Dinner this weekend?",
    snippet:
      "Checking if Saturday still works. I can move the reservation later if your demo work runs long.",
    tag: "personal",
    suggested: "Reply · confirm Saturday",
  },
  {
    from: "Travel alerts",
    address: "alerts@rail.pt",
    subject: "Schedule change for your Lisbon trip",
    snippet:
      "Your return train has moved by 18 minutes. No action is required unless you want a refund.",
    tag: "travel",
    suggested: "Add calendar note",
  },
  {
    from: "GitHub",
    address: "noreply@github.com",
    subject: "Security advisory digest",
    snippet:
      "One dependency in a personal project has a moderate advisory. Review recommended patch versions.",
    tag: "automation",
    suggested: "Create task",
  },
];

const researcherPersonalEmails: (EmailSeed & { received?: string })[] = [
  {
    from: "Hugo Vasquez",
    address: "hugo@hugo.dev",
    subject: "Climbing this weekend?",
    snippet:
      "Saturday's looking dry. Same crag as last time? I'll bring the second rope.",
    tag: "personal",
    suggested: "Reply · confirm",
  },
  {
    from: "Travel alerts",
    address: "alerts@flyair.eu",
    subject: "Flight change — NeurIPS travel",
    snippet:
      "Your December flight to Vancouver moved by 90 minutes. Connection still valid. No action required.",
    tag: "travel",
    suggested: "Update calendar",
  },
  {
    from: "Stripe",
    address: "noreply@stripe.com",
    subject: "Subscription renewal — Overleaf",
    snippet:
      "Annual plan auto-renews next Monday. Card ending 4242. Manage at billing portal.",
    tag: "automation",
    suggested: "Archive",
  },
];

const developerPersonalEmails: (EmailSeed & { received?: string })[] = [
  {
    from: "Mom",
    address: "mom@example.com",
    subject: "Are you eating?",
    snippet:
      "You haven't called in two weeks. I'm not mad. Just call me.",
    tag: "personal",
    suggested: "Reply · call this evening",
  },
  {
    from: "Cloudflare",
    address: "noreply@cloudflare.com",
    subject: "Domain renewal — yourname.dev",
    snippet:
      "Auto-renewal scheduled for May 28. No action required if card on file is current.",
    tag: "automation",
    suggested: "Archive",
  },
  {
    from: "Strava",
    address: "no-reply@strava.com",
    subject: "Weekly summary — 3 runs, 27km",
    snippet:
      "Nice week. Best effort: 5km in 22:08. Two friends gave you kudos.",
    tag: "personal",
    suggested: "Archive",
  },
];

const writerPersonalEmails: (EmailSeed & { received?: string })[] = [
  {
    from: "Theo Hart",
    address: "theo@theagency.co",
    subject: "Dinner before the reading?",
    snippet:
      "Thursday around 6? There's that place on Rua das Flores you liked. I'll book.",
    tag: "personal",
    suggested: "Reply · confirm Thu 18:00",
  },
  {
    from: "Forwarded — Anya Pereira",
    address: "anya.p@example.com",
    subject: "Reader letter",
    snippet:
      "Your essay on solitude landed at exactly the right week. I read it three times. Thank you for writing it.",
    tag: "personal",
    suggested: "Reply · personal note",
  },
  {
    from: "Local bookstore",
    address: "events@atlasbooks.pt",
    subject: "Confirming Thursday reading",
    snippet:
      "Doors 17:30, reading 18:00, signing till 19:30. We'll have 80 chairs and a Q&A mic.",
    tag: "event",
    suggested: "Add to calendar",
  },
];

const founderResources: ResourceSeed[] = [
  { name: "bridge-01", role: "API node", status: "ok", cpu: 22, ram: 48 },
  { name: "harbor-02", role: "Worker pool", status: "ok", cpu: 64, ram: 71 },
  { name: "lantern-03", role: "Mongo primary", status: "warn", cpu: 81, ram: 88 },
  { name: "compass-04", role: "Redis", status: "ok", cpu: 11, ram: 19 },
];

const researcherResources: ResourceSeed[] = [
  { name: "gpu-a100-01", role: "Training node", status: "ok", cpu: 72, ram: 64 },
  { name: "gpu-a100-02", role: "Training node", status: "warn", cpu: 91, ram: 87 },
  { name: "preproc-01", role: "Data preprocess", status: "ok", cpu: 35, ram: 52 },
  { name: "jupyter-hub", role: "Notebook server", status: "ok", cpu: 18, ram: 31 },
];

const developerResources: ResourceSeed[] = [
  { name: "api-prod-01", role: "API node", status: "ok", cpu: 28, ram: 54 },
  { name: "ci-runner-02", role: "Build runner", status: "warn", cpu: 84, ram: 79 },
  { name: "pg-primary", role: "Postgres primary", status: "ok", cpu: 41, ram: 62 },
  { name: "nats-jet-01", role: "NATS JetStream", status: "ok", cpu: 19, ram: 27 },
];

const writerResources: ResourceSeed[] = [
  { name: "site-edge", role: "Static site CDN", status: "ok", cpu: 8, ram: 14 },
  { name: "newsletter-svc", role: "Mailing service", status: "ok", cpu: 22, ram: 36 },
  { name: "drafts-sync", role: "Drafts sync worker", status: "warn", cpu: 78, ram: 71 },
  { name: "backup-cold", role: "Manuscript backup", status: "ok", cpu: 4, ram: 9 },
];

const founderAssistant: AssistantMessageSeed[] = [
  { who: "you", text: "What did I commit to this week, and what's still open?" },
  {
    who: "helm",
    text: "Three open commitments: ship the MVP candidate by Friday, send Marius the design draft, and follow up with Sofia (Lighthouse) before Thursday.",
  },
  { who: "you", text: "Draft the Sofia follow-up using last quarter's update." },
  {
    who: "helm",
    text: "Drafted. Tone matched to your prior thread — warm, brief, one ask. I'll send when you approve.",
    approval: { label: "Send email to sofia@lighthouse.vc", risk: "high" },
  },
];

const researcherAssistant: AssistantMessageSeed[] = [
  { who: "you", text: "Summarize today's reading group in two lines." },
  {
    who: "helm",
    text: "Lin et al. claim sparsity routing cuts FLOPs ~38% with no accuracy drop. Main weakness: eval set overlaps ~11% with their pretraining corpus — flagged for the area chair.",
  },
  { who: "you", text: "Draft a rebuttal paragraph addressing R2's contamination concern." },
  {
    who: "helm",
    text: "Drafted §4.2 rebuttal — leads with the MinHash overlap stats, cites our held-out screened benchmark, ends with the ablation table reference. Ready to attach to the OpenReview thread.",
    approval: { label: "Post rebuttal to OpenReview thread", risk: "high" },
  },
];

const developerAssistant: AssistantMessageSeed[] = [
  { who: "you", text: "Why is /api/search slow on prod?" },
  {
    who: "helm",
    text: "Top span: full-table scan on notes_fts. No index on user_id. Suggested: composite index (user_id, updated_at DESC) plus bump shared_buffers. Estimated p95: 140ms → 22ms.",
  },
  { who: "you", text: "Open a PR with the migration." },
  {
    who: "helm",
    text: "Migration drafted in branch perf/notes-idx. CREATE INDEX CONCURRENTLY, separate file from the auth migration so it can roll back independently. CI run scheduled on push.",
    approval: { label: "Push branch perf/notes-idx and open PR", risk: "high" },
  },
];

const writerAssistant: AssistantMessageSeed[] = [
  { who: "you", text: "Sharpen this paragraph for me." },
  {
    who: "helm",
    text: "Cut 'in many ways' and merge sentences 2 and 3. Lead with the image of the empty chair — that's the strongest line. Trim two adverbs in sentence 4.",
  },
  { who: "you", text: "Draft the reply to Maya about chapter 5." },
  {
    who: "helm",
    text: "Drafted reply — accepts the 400-word cut, proposes keeping the dinner scene verbatim, suggests Wednesday delivery. Tone matched to your prior threads with her.",
    approval: { label: "Send email to maya@penguin.co", risk: "high" },
  },
];

const founderTools = [
  "notes.search",
  "tasks.upsert",
  "calendar.create",
  "people.followup",
  "email.send",
  "resources.restart",
];

const researcherTools = [
  "notes.search",
  "papers.cite",
  "experiments.queue",
  "calendar.create",
  "openreview.post",
  "datasets.fetch",
];

const developerTools = [
  "notes.search",
  "tasks.upsert",
  "git.open_pr",
  "ci.rerun",
  "pager.ack",
  "resources.restart",
];

const writerTools = [
  "notes.search",
  "drafts.diff",
  "calendar.create",
  "people.followup",
  "newsletter.queue",
  "email.send",
];

// ---------- EXPORT MAP ----------

export const PERSONA_SEEDS: Record<PersonaKey, PersonaSeed> = {
  researcher: {
    key: "researcher",
    tagline:
      "Papers, experiments, and reading groups — kept local, linked, and on deadline.",
    groups: researcherGroups,
    notes: researcherNotes,
    edges: researcherEdges,
    kanban: researcherKanban,
    calendarEvents: researcherCalendar,
    people: researcherPeople,
    emails: researcherEmails,
    personalEmails: researcherPersonalEmails,
    resources: researcherResources,
    assistantTranscript: researcherAssistant,
    assistantTools: researcherTools,
  },
  founder: {
    key: "founder",
    tagline:
      "A live console. Toggle modules. Helm is a registry — disable one and it leaves the bridge entirely.",
    groups: founderGroups,
    notes: founderNotes,
    edges: founderEdges,
    kanban: founderKanban,
    calendarEvents: founderCalendar,
    people: founderPeople,
    emails: founderEmails,
    personalEmails: founderPersonalEmails,
    resources: founderResources,
    assistantTranscript: founderAssistant,
    assistantTools: founderTools,
  },
  developer: {
    key: "developer",
    tagline:
      "RFCs, incidents, and on-call work — wired to your code, your CI, and your pager.",
    groups: developerGroups,
    notes: developerNotes,
    edges: developerEdges,
    kanban: developerKanban,
    calendarEvents: developerCalendar,
    people: developerPeople,
    emails: developerEmails,
    personalEmails: developerPersonalEmails,
    resources: developerResources,
    assistantTranscript: developerAssistant,
    assistantTools: developerTools,
  },
  writer: {
    key: "writer",
    tagline:
      "Drafts, editor feedback, and reader letters — the whole book lives in one room.",
    groups: writerGroups,
    notes: writerNotes,
    edges: writerEdges,
    kanban: writerKanban,
    calendarEvents: writerCalendar,
    people: writerPeople,
    emails: writerEmails,
    personalEmails: writerPersonalEmails,
    resources: writerResources,
    assistantTranscript: writerAssistant,
    assistantTools: writerTools,
  },
};

export const CALENDAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
