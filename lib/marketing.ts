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
} from "lucide-react";

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

export const NOTES = [
  {
    title: "Founding doctrine",
    tag: "manifesto",
    body: "A personal OS, not another productivity suite. The captain decides which instruments are on the bridge.",
    edges: ["principles", "modules"],
  },
  {
    title: "Why Helm > Notion",
    tag: "positioning",
    body: "Notion treats your life as documents. Helm treats it as a workspace with a registry, jobs, and an operator.",
    edges: ["assistant", "modules"],
  },
  {
    title: "Pomodoro session 14",
    tag: "journal",
    body: "Wrote MVP scope. Cut shared workspaces, mobile, and authenticator. Ship the single-user bridge first.",
    edges: ["mvp", "scope"],
  },
  {
    title: "Inbox triage rules",
    tag: "settings",
    body: "Investors → review. Newsletters → archive. Anything marked urgent → ask before deciding.",
    edges: ["assistant", "email"],
  },
];

export const KANBAN : { column: string; cards: { title: string; tag: string; prio: "low" | "med" | "high"; due?: string }[] }[] = [
  {
    column: "Backlog",
    cards: [
      { title: "Pin Next.js 16 LTS in web app", tag: "infra", prio: "low" as const },
      { title: "Workspace template — Founder", tag: "onboarding", prio: "med" as const },
      { title: "Approval policy schema", tag: "assistant", due: "Fri", prio: "high" as const },
    ],
  },
  {
    column: "In progress",
    cards: [
      { title: "Module registry → palette wiring", tag: "core", due: "Today", prio: "high" as const },
      { title: "Audit log writer", tag: "security", prio: "med" as const },
    ],
  },
  {
    column: "Done",
    cards: [
      { title: "Stripe webhooks → entitlements", tag: "billing", prio: "high" as const },
      { title: "Desktop device-code activation", tag: "desktop", prio: "med" as const },
    ],
  },
];

export const CALENDAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const CALENDAR_EVENTS = [
  { day: 0, start: 9, span: 2, title: "Deep work — registry", kind: "focus" as const },
  { day: 0, start: 14, span: 1, title: "Tauri review", kind: "meet" as const },
  { day: 1, start: 10, span: 3, title: "MVP planning", kind: "focus" as const },
  { day: 2, start: 9, span: 1, title: "Standup", kind: "meet" as const },
  { day: 2, start: 11, span: 2, title: "Inbox triage design", kind: "focus" as const },
  { day: 3, start: 15, span: 2, title: "Investor — Lighthouse", kind: "meet" as const },
  { day: 4, start: 9, span: 4, title: "Ship MVP candidate", kind: "focus" as const },
  { day: 5, start: 11, span: 1, title: "Birthday · Ana", kind: "personal" as const },
];

export const PEOPLE = [
  { name: "Ana Brandão", role: "co-founder", last: "2d", next: "Birthday · Sat" },
  { name: "Marius Holm", role: "design partner", last: "5d", next: "Send draft" },
  { name: "Sofia Patel", role: "investor", last: "11d", next: "Follow-up" },
  { name: "Jonas Weber", role: "engineer", last: "1mo", next: "Reintroduce" },
  { name: "Lin Yu", role: "writer", last: "3w", next: "Trade essay" },
  { name: "Kemi Adeyemi", role: "ops lead", last: "today", next: "Approve TOS" },
];

export const EMAILS = [
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
    snippet: "Pushed v3 to Figma. Tightened the empty states and the approval banner. Not urgent.",
    tag: "design",
    suggested: "Create task · review by Thu",
  },
  {
    from: "Linear",
    address: "notify@linear.app",
    subject: "5 issues assigned this week",
    snippet: "Helm/MVP — auth-flow, billing-edge-case, palette-shortcuts, audit-write, deletion-cleanup.",
    tag: "automation",
    suggested: "Archive",
  },
];

export const RESOURCES = [
  { name: "bridge-01", role: "API node", status: "ok" as const, cpu: 22, ram: 48 },
  { name: "harbor-02", role: "Worker pool", status: "ok" as const, cpu: 64, ram: 71 },
  { name: "lantern-03", role: "Mongo primary", status: "warn" as const, cpu: 81, ram: 88 },
  { name: "compass-04", role: "Redis", status: "ok" as const, cpu: 11, ram: 19 },
];

export const ASSISTANT_TRANSCRIPT: {
  who: "you" | "helm";
  text: string;
  approval?: { label: string; risk: "low" | "med" | "high" };
}[] = [
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
