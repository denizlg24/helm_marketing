"use client";

import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FilePlus2,
  FileText,
  FolderTree,
  LayoutGrid,
  Link as LinkIcon,
  List,
  Loader2,
  Mail,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Server,
  Shapes,
  Sparkles,
  Tag as TagIcon,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GroupTreeCombobox } from "@/components/demo-notes/group-tree-combobox";
import { NoteGraph } from "@/components/demo-notes/note-graph";
import { NoteList } from "@/components/demo-notes/note-list";
import { TagAutocomplete } from "@/components/demo-notes/tag-autocomplete";
import { EntityGraph } from "@/components/graph/entity-graph";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  INote,
  INoteEdge,
  INoteGroup,
  IPerson,
  IPersonEdge,
  IPersonGroup,
} from "@/lib/data-types";
import { classColor } from "@/lib/bookmark-color";
import { buildDescendantIdMap, buildPathLabelMap } from "@/lib/note-group-tree";
import {
  CALENDAR_DAYS,
  DEMO_MODULES,
  PERSONA_SEEDS,
  PERSONAS,
  type AssistantMessageSeed,
  type DemoModule,
  type ModuleKey,
  type PersonaKey,
  type PersonaSeed,
} from "@/lib/persona-data";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type View = "graph" | "list";
type Sort = "updated-desc" | "updated-asc" | "title-asc" | "title-desc";
type StatusFilter = "all" | INote["status"];
type DemoKanbanCard = {
  id: string;
  title: string;
  tag: string;
  prio: "low" | "med" | "high";
  due?: string;
  done?: boolean;
};
type DemoKanbanColumn = {
  id: string;
  title: string;
  color: string;
  cards: DemoKanbanCard[];
};
type TemporalDemoData = ReturnType<typeof buildTemporalDemoData>;

const now = "2026-05-22T08:30:00.000Z";

function buildTemporalDemoData(anchor: Date, seed: PersonaSeed) {
  const dayMs = 24 * 60 * 60 * 1000;
  const atDay = (offset: number, hour = 9, minute = 0) => {
    const date = new Date(anchor);
    date.setHours(hour, minute, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
  };
  const iso = (offset: number, hour = 9) => atDay(offset, hour).toISOString();
  const rel = (date: Date) => {
    const diff = Math.round((date.getTime() - anchor.getTime()) / dayMs);
    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    if (diff === -1) return "yesterday";
    if (diff > 0 && diff < 7) {
      return date.toLocaleDateString(undefined, { weekday: "short" });
    }
    if (diff < 0 && diff > -7) return `${Math.abs(diff)}d`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const noteOffsets = [-1, -2, -4, -8, -13];
  const notes = seed.notes.map((note, index) => ({
    ...note,
    createdAt: iso((noteOffsets[index] ?? -index - 1) - 3, 10),
    updatedAt: iso(noteOffsets[index] ?? -index - 1, 14),
  }));

  const dueOffsets = [1, 3, 0, 0, 2, -1, -5];
  let dueIndex = 0;
  const kanban = seed.kanban.map((column) => ({
    ...column,
    cards: column.cards.map((card) => {
      const offset = dueOffsets[dueIndex++ % dueOffsets.length];
      return {
        ...card,
        due: card.due ? rel(atDay(offset)) : card.due,
      };
    }),
  }));

  const calendarOffsets = [-2, -1, 0, 1, 2, 4, 7, 12];
  const calendarEvents = seed.calendarEvents.map((event, index) => {
    const date = atDay(calendarOffsets[index] ?? index, event.start);
    return {
      ...event,
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      dateObj: date,
    };
  });

  const birthdayOffsets = [-42, -12, 8, 19, 36, 54];
  const people = seed.people.map((person, index) => {
    const birthday = atDay(birthdayOffsets[index] ?? index * 7);
    return {
      ...person,
      last: rel(atDay(-Math.max(0, index * 3 + 1))),
      next:
        index === 0
          ? `Birthday · ${rel(birthday)}`
          : index === 2
            ? `Follow-up · ${rel(atDay(2))}`
            : person.next,
      birthdayLabel: birthday.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  });

  const emailOffsets = [0, -1, -3];
  const emails = seed.emails.map((email, index) => ({
    ...email,
    received: rel(atDay(emailOffsets[index] ?? -index, 11 + index)),
  }));
  const personalOffsets = [-1, -4, -6];
  const personalHours = [19, 8, 10];
  const personalEmails = seed.personalEmails.map((email, index) => ({
    ...email,
    received: rel(
      atDay(personalOffsets[index] ?? -index - 1, personalHours[index] ?? 10),
    ),
  }));
  const inboxes = {
    work: emails,
    personal: personalEmails,
  };

  const resources = seed.resources.map((resource, index) => ({
    ...resource,
    lastChecked: rel(
      atDay(0, anchor.getHours(), anchor.getMinutes() - index * 7),
    ),
  }));

  return {
    notes,
    groups: seed.groups,
    edges: seed.edges,
    kanban,
    calendarEvents,
    people,
    emails,
    inboxes,
    resources,
    assistantTranscript: seed.assistantTranscript,
    assistantTools: seed.assistantTools,
  };
}

const ALL_MODULE_KEYS = DEMO_MODULES.map((module) => module.key);

export function DemoDashboard() {
  const [persona, setPersona] = useState<PersonaKey>("founder");
  const [enabledModules, setEnabledModules] = useState<Set<ModuleKey>>(
    () => new Set(ALL_MODULE_KEYS),
  );

  const seed = PERSONA_SEEDS[persona];
  const temporalData = useMemo(
    () => buildTemporalDemoData(new Date(), seed),
    [seed],
  );

  const visibleModules = useMemo(
    () => DEMO_MODULES.filter((module) => enabledModules.has(module.key)),
    [enabledModules],
  );

  const toggleModule = useCallback((key: ModuleKey) => {
    setEnabledModules((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        if (next.size === 1) return current;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 md:py-32"
    >
      <Reveal>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          The Bridge
        </p>
        <h2
          id="demo-heading"
          className="mt-3 max-w-4xl text-balance font-[var(--font-calistoga)] text-4xl leading-tight tracking-tight text-primary md:text-5xl"
        >
          A live console. Built around you.{" "}
          <em className="italic text-accent-strong/90">
            Watch the ship change.
          </em>
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{seed.tagline}</p>
      </Reveal>

      <div className="mt-8 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
        <DemoControlsPanel
          persona={persona}
          onPersonaChange={setPersona}
          enabledModules={enabledModules}
          onToggleModule={toggleModule}
        />
        <div className="min-w-0">
          <Reveal
            delay={120}
            y={20}
            className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_30px_80px_-45px_rgba(48,54,48,0.45)]"
          >
            <DemoAppShell
              key={persona}
              persona={persona}
              data={temporalData}
              modules={visibleModules}
            />
          </Reveal>
          <p
            role="note"
            className="mx-auto mt-3 max-w-2xl text-balance text-center text-[11px] leading-relaxed text-muted-foreground/80"
          >
            This is an illustrative preview, not the live product. Layouts,
            copy, and data are mocked for presentation purposes — the shipping
            version may differ in surface and behaviour.
          </p>
        </div>
      </div>
    </section>
  );
}

function DemoControlsPanel({
  persona,
  onPersonaChange,
  enabledModules,
  onToggleModule,
}: {
  persona: PersonaKey;
  onPersonaChange: (next: PersonaKey) => void;
  enabledModules: Set<ModuleKey>;
  onToggleModule: (key: ModuleKey) => void;
}) {
  return (
    <aside
      aria-label="Demo configuration"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="rounded-xl border border-border/60 bg-surface/40 p-4 md:p-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Who are you?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const active = persona === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onPersonaChange(p.key)}
                aria-pressed={active}
                className={cn(
                  "group flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-all",
                  active
                    ? "border-accent-strong/60 bg-accent/30 text-primary shadow-sm"
                    : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    active
                      ? "text-accent-strong"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-none">
                    {p.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground/80">
                    {p.blurb}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Modules
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DEMO_MODULES.map((module) => {
            const Icon = module.icon;
            const on = enabledModules.has(module.key);
            return (
              <button
                key={module.key}
                type="button"
                onClick={() => onToggleModule(module.key)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                  on
                    ? "border-accent-strong/60 bg-accent/40 text-primary"
                    : "border-border/60 bg-background/30 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon className="size-3" />
                {module.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/70">
          {enabledModules.size} of {DEMO_MODULES.length} modules enabled · at
          least one stays on.
        </p>
      </div>
    </aside>
  );
}

function DemoAppShell({
  persona: _persona,
  data,
  modules,
}: {
  persona: PersonaKey;
  data: TemporalDemoData;
  modules: DemoModule[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialActive = modules[0]?.key ?? "notes";
  const [active, setActive] = useState<ModuleKey>(initialActive);

  useEffect(() => {
    if (!modules.some((module) => module.key === active)) {
      setActive(modules[0]?.key ?? "notes");
    }
  }, [modules, active]);

  const activeModule = modules.find((module) => module.key === active);

  return (
    <div className="h-[760px] max-h-[calc(100svh-2rem)] min-h-[620px] bg-background md:h-[780px]">
      <div className="flex h-11 items-center justify-between border-b bg-secondary/40 px-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <PanelLeft className="size-3.5" />
          </Button>
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-accent/80" />
            <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          </div>
          <span className="text-xs font-medium text-foreground">
            {activeModule?.label ?? "Helm"}
          </span>
        </div>
        <span className="rounded-full border bg-background/70 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          Demo data
        </span>
      </div>

      <div className="relative grid h-[calc(100%-2.75rem)] grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)]">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 z-20 bg-primary/25 backdrop-blur-[2px] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-secondary/95 p-3 shadow-xl transition-transform md:static md:w-auto md:translate-x-0 md:bg-secondary/30 md:shadow-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="mb-3 flex items-center justify-between md:hidden">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Workspace
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <p className="px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>
          <nav className="mt-2 space-y-1" aria-label="Demo modules">
            {modules.map((module) => {
              const Icon = module.icon;
              const selected = active === module.key;
              return (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => {
                    setActive(module.key);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition",
                    selected
                      ? "bg-card text-foreground shadow-sm"
                      : "text-foreground/75 hover:bg-card/70 hover:text-foreground",
                  )}
                  aria-current={selected ? "page" : undefined}
                >
                  <Icon className="size-3.5" />
                  <span className="min-w-0 flex-1 truncate">
                    {module.label}
                  </span>
                  <span className="hidden text-[10px] text-muted-foreground xl:inline">
                    {module.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <DemoModulePanel active={active} data={data} />
      </div>
    </div>
  );
}

function DemoModulePanel({
  active,
  data,
}: {
  active: ModuleKey;
  data: TemporalDemoData;
}) {
  if (active === "notes")
    return (
      <NotesDemoPage
        notesData={data.notes}
        groupsData={data.groups}
        edgesData={data.edges}
      />
    );
  if (active === "kanban") return <KanbanDemoPage kanbanData={data.kanban} />;
  if (active === "calendar")
    return <CalendarDemoPage eventsData={data.calendarEvents} />;
  if (active === "people") return <PeopleDemoPage peopleData={data.people} />;
  if (active === "inbox") return <InboxDemoPage inboxesData={data.inboxes} />;
  if (active === "resources")
    return <ResourcesDemoPage resourcesData={data.resources} />;
  return (
    <AssistantDemoPage
      transcript={data.assistantTranscript}
      tools={data.assistantTools}
    />
  );
}

function NotesDemoPage({
  notesData,
  groupsData,
  edgesData,
}: {
  notesData: INote[];
  groupsData: INoteGroup[];
  edgesData: INoteEdge[];
}) {
  const [view, setView] = useState<View>("graph");
  const [notes, setNotes] = useState<INote[]>(notesData);
  const [groups, setGroups] = useState<INoteGroup[]>(groupsData);
  const [edges, setEdges] = useState<INoteEdge[]>(edgesData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedGroupFilters, setSelectedGroupFilters] = useState<string[]>(
    [],
  );
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<Sort>("updated-desc");

  const allTags = useMemo(
    () =>
      [...new Set(notes.flatMap((note) => note.tags ?? []))].sort(
        (left, right) => left.localeCompare(right),
      ),
    [notes],
  );
  const pathLabelById = useMemo(() => buildPathLabelMap(groups), [groups]);
  const descendantIdsByGroup = useMemo(
    () => buildDescendantIdMap(groups),
    [groups],
  );
  const selectedGroupScope = useMemo(() => {
    const next = new Set<string>();
    for (const groupId of selectedGroupFilters) {
      for (const scopedId of descendantIdsByGroup.get(groupId) ?? [groupId]) {
        next.add(scopedId);
      }
    }
    return next;
  }, [descendantIdsByGroup, selectedGroupFilters]);

  const filteredNotes = useMemo(() => {
    return sortNotes(
      notes.filter((note) => {
        const groupSearchLabels = (note.groupIds ?? [])
          .map((groupId) => pathLabelById.get(groupId))
          .filter((label): label is string => Boolean(label));
        const haystack = [
          note.title,
          note.content,
          note.description,
          note.class,
          ...(note.tags ?? []),
          ...groupSearchLabels,
        ]
          .join(" ")
          .toLowerCase();
        if (query.trim() && !haystack.includes(query.trim().toLowerCase())) {
          return false;
        }
        if (statusFilter !== "all" && note.status !== statusFilter) {
          return false;
        }
        if (
          selectedGroupScope.size > 0 &&
          !(note.groupIds ?? []).some((groupId) =>
            selectedGroupScope.has(groupId),
          )
        ) {
          return false;
        }
        if (
          selectedTagFilters.length > 0 &&
          !selectedTagFilters.every((tag) => (note.tags ?? []).includes(tag))
        ) {
          return false;
        }
        return true;
      }),
      sort,
    );
  }, [
    notes,
    pathLabelById,
    query,
    selectedGroupScope,
    selectedTagFilters,
    sort,
    statusFilter,
  ]);

  const graphGroups = useMemo(
    () => collectVisibleGroups(filteredNotes, groups),
    [filteredNotes, groups],
  );
  const graphEdges = useMemo(() => {
    const visibleIds = new Set(filteredNotes.map((note) => note._id));
    return edges.filter(
      (edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to),
    );
  }, [edges, filteredNotes]);
  const selectedNote = notes.find((note) => note._id === selectedId) ?? null;
  const hasActiveFilters =
    query.trim() ||
    selectedGroupFilters.length ||
    selectedTagFilters.length ||
    statusFilter !== "all" ||
    sort !== "updated-desc";

  const patchNote = (id: string, patch: Partial<INote>) => {
    const updatedAt = new Date().toISOString();
    setNotes((current) =>
      current.map((note) =>
        note._id === id ? { ...note, ...patch, updatedAt } : note,
      ),
    );
  };

  const createNote = () => {
    const id = `n-demo-${Date.now()}`;
    const next = note({
      id,
      title: "Untitled note",
      content: "# Untitled note\n\nStart writing in markdown.",
      tags: ["draft"],
      groupIds: ["g-writing"],
      className: "note",
      updatedAt: new Date().toISOString(),
    });
    setNotes((current) => [next, ...current]);
    setSelectedId(id);
  };

  const deleteNote = (id: string) => {
    setNotes((current) => current.filter((note) => note._id !== id));
    setEdges((current) =>
      current.filter((edge) => edge.from !== id && edge.to !== id),
    );
    setSelectedId(null);
  };

  const createGroup = async (name: string) => {
    const next = group(`g-demo-${Date.now()}`, name, null, "#a1bc98");
    setGroups((current) => [...current, next]);
    return next;
  };

  if (selectedNote) {
    return (
      <DemoNoteDetail
        note={selectedNote}
        allNotes={notes}
        groups={groups}
        edges={edges}
        suggestions={allTags}
        onBack={() => setSelectedId(null)}
        onDelete={() => deleteNote(selectedNote._id)}
        onPatch={(patch) => patchNote(selectedNote._id, patch)}
        onCreateGroup={createGroup}
        onSelectNote={(next) => setSelectedId(next._id)}
      />
    );
  }

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 flex-col gap-2 border-b px-3 py-3 lg:h-12 lg:flex-row lg:items-center lg:py-0">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0" />
          <h3 className="text-sm font-medium">Notes</h3>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {filteredNotes.length} / {notes.length} · {groups.length} groups
          </span>
          <Badge variant="outline" className="hidden h-5 text-[10px] sm:flex">
            semantic off
          </Badge>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:flex-nowrap">
          <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, content, tags..."
              className="h-8 pl-7 text-xs"
            />
          </div>

          <Tabs value={view} onValueChange={(value) => setView(value as View)}>
            <TabsList className="h-8">
              <TabsTrigger value="graph" className="h-6 px-2 text-xs">
                <LayoutGrid className="size-3.5" />
              </TabsTrigger>
              <TabsTrigger value="list" className="h-6 px-2 text-xs">
                <List className="size-3.5" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button size="sm" className="h-8" onClick={createNote}>
            <FilePlus2 className="size-3.5" />
            Note
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
        <span className="flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <FolderTree className="size-3.5" />
        </span>
        <GroupTreeCombobox
          groups={groups}
          value={selectedGroupFilters}
          onChange={setSelectedGroupFilters}
          placeholder="Filter groups..."
          searchPlaceholder="Search group hierarchy..."
          emptyMessage="No groups yet"
        />

        <span className="ml-1 flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <TagIcon className="size-3.5" />
        </span>
        <TagAutocomplete
          value={selectedTagFilters}
          onChange={setSelectedTagFilters}
          suggestions={allTags}
          placeholder="Filter tags..."
          allowCreate={false}
          searchPlaceholder="Search tags..."
          emptyMessage="No tags found"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger size="sm" className="ml-auto h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
          <SelectTrigger size="sm" className="h-7 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated-desc">Updated newest</SelectItem>
            <SelectItem value="updated-asc">Updated oldest</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
          </SelectContent>
        </Select>

        {Boolean(hasActiveFilters) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              setQuery("");
              setSelectedGroupFilters([]);
              setSelectedTagFilters([]);
              setStatusFilter("all");
              setSort("updated-desc");
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {view === "graph" ? (
          <NoteGraph
            notes={filteredNotes}
            groups={graphGroups}
            edges={graphEdges}
            onSelectNote={(selected) => setSelectedId(selected._id)}
            onSelectGroup={(selected) =>
              setSelectedGroupFilters([selected._id])
            }
          />
        ) : (
          <NoteList
            notes={filteredNotes}
            groups={groups}
            onSelect={(selected) => setSelectedId(selected._id)}
            onSelectGroup={(selected) =>
              setSelectedGroupFilters([selected._id])
            }
          />
        )}
      </div>
    </main>
  );
}

function DemoNoteDetail({
  note,
  allNotes,
  groups,
  edges,
  suggestions,
  onBack,
  onDelete,
  onPatch,
  onCreateGroup,
  onSelectNote,
}: {
  note: INote;
  allNotes: INote[];
  groups: INoteGroup[];
  edges: INoteEdge[];
  suggestions: string[];
  onBack: () => void;
  onDelete: () => void;
  onPatch: (patch: Partial<INote>) => void;
  onCreateGroup: (name: string) => Promise<INoteGroup | null>;
  onSelectNote: (note: INote) => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [initialContent, setInitialContent] = useState(note.content);
  const pathLabelById = useMemo(() => buildPathLabelMap(groups), [groups]);
  const relatedNotes = useMemo(() => {
    const relatedIds = new Set<string>();
    for (const relation of edges) {
      if (relation.from === note._id) relatedIds.add(relation.to);
      if (relation.to === note._id) relatedIds.add(relation.from);
    }
    return allNotes.filter((candidate) => relatedIds.has(candidate._id));
  }, [allNotes, edges, note._id]);

  const commitContent = () => {
    onPatch({ content });
    setInitialContent(content);
  };

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={onBack} title="Back">
            <ArrowLeft className="size-4" />
          </Button>
          {note.favicon ? (
            <Image
              src={note.favicon}
              alt=""
              width={16}
              height={16}
              className="size-4 rounded-sm"
              unoptimized
            />
          ) : (
            <FileText className="size-4" />
          )}
          <span className="truncate text-xs text-muted-foreground">
            {note.url ? safeHostname(note.url) : "Markdown note"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-5 sm:px-6">
          <Input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              onPatch({ title: event.target.value || "Untitled note" });
            }}
            className="h-auto border-none bg-transparent px-0 py-1 text-2xl font-semibold shadow-none focus-visible:ring-0"
            placeholder="Untitled note"
          />

          <div className="mt-5">
            <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Properties
            </h4>
            <div className="divide-y border-y text-xs">
              <PropertyRow
                icon={<CalendarIcon className="size-3" />}
                label="created_on"
              >
                <span className="text-muted-foreground">
                  {formatDate(note.createdAt)}
                </span>
              </PropertyRow>
              <PropertyRow icon={<Shapes className="size-3" />} label="class">
                <Input
                  value={note.class ?? ""}
                  onChange={(event) => onPatch({ class: event.target.value })}
                  placeholder="video, article, paper..."
                  className="h-6 border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
                />
              </PropertyRow>
              <PropertyRow icon={<TagIcon className="size-3" />} label="tags">
                <TagAutocomplete
                  value={note.tags ?? []}
                  suggestions={suggestions}
                  onChange={(tags) => onPatch({ tags })}
                />
              </PropertyRow>
              <PropertyRow
                icon={<FolderTree className="size-3" />}
                label="groups"
              >
                <GroupTreeCombobox
                  groups={groups}
                  value={note.groupIds ?? []}
                  onChange={(groupIds) => onPatch({ groupIds })}
                  onCreateGroup={onCreateGroup}
                  placeholder="Add group..."
                  searchPlaceholder="Search group hierarchy..."
                />
              </PropertyRow>
              <PropertyRow
                icon={<FileText className="size-3" />}
                label="status"
              >
                <Select
                  value={note.status}
                  onValueChange={(value) =>
                    onPatch({ status: value as INote["status"] })
                  }
                >
                  <SelectTrigger className="h-6 w-32 border-none bg-transparent px-1 text-xs shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">open</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
              </PropertyRow>
              <PropertyRow
                icon={<LinkIcon className="size-3" />}
                label="related"
              >
                <div className="flex flex-wrap items-center gap-1">
                  {relatedNotes.length === 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      None
                    </span>
                  )}
                  {relatedNotes.map((related) => (
                    <button
                      key={related._id}
                      type="button"
                      onClick={() => onSelectNote(related)}
                      className="inline-flex items-center gap-1 rounded-md border bg-muted/20 px-1.5 py-0.5 text-[10px] hover:bg-muted"
                    >
                      <FileText className="size-2.5" />
                      <span className="max-w-[12rem] truncate">
                        {related.title}
                      </span>
                    </button>
                  ))}
                </div>
              </PropertyRow>
              {(note.groupIds ?? []).length > 0 && (
                <PropertyRow
                  icon={<FolderTree className="size-3" />}
                  label="summary"
                >
                  <div className="flex flex-wrap gap-1">
                    {note.groupIds.map((groupId) => (
                      <Badge
                        key={groupId}
                        variant="secondary"
                        className="h-4 px-1.5 text-[10px]"
                      >
                        {pathLabelById.get(groupId) ?? groupId}
                      </Badge>
                    ))}
                  </div>
                </PropertyRow>
              )}
            </div>
          </div>

          <div className="mt-6 flex min-h-[30rem] flex-1 flex-col border-t pt-4">
            <MarkdownEditor
              value={content}
              initialValue={initialContent}
              onChange={setContent}
              onSave={commitContent}
              placeholder="Write a note in markdown..."
              className="min-h-[30rem]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function KanbanDemoPage({
  kanbanData,
}: {
  kanbanData: TemporalDemoData["kanban"];
}) {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [columns, setColumns] = useState<DemoKanbanColumn[]>(() =>
    kanbanData.map((column, columnIndex) => ({
      id: `col-${columnIndex}`,
      title: column.column,
      color: ["#647560", "#a1bc98", "#9cc5c9"][columnIndex] ?? "#a1bc98",
      cards: column.cards.map((card, cardIndex) => ({
        id: `card-${columnIndex}-${cardIndex}`,
        ...card,
      })),
    })),
  );
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addingCardColumnId, setAddingCardColumnId] = useState<string | null>(
    null,
  );
  const [newCardTitle, setNewCardTitle] = useState("");
  const [dragging, setDragging] = useState<
    | { kind: "card"; cardId: string; fromColumnId: string }
    | { kind: "column"; columnId: string }
    | null
  >(null);

  const addCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    setColumns((current) =>
      current.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: [
                ...column.cards,
                {
                  id: `card-${Date.now()}`,
                  title: newCardTitle.trim(),
                  tag: "demo",
                  prio: "med",
                },
              ],
            }
          : column,
      ),
    );
    setNewCardTitle("");
    setAddingCardColumnId(null);
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    setColumns((current) => [
      ...current,
      {
        id: `col-${Date.now()}`,
        title: newColumnTitle.trim(),
        color: "#c9b8d4",
        cards: [],
      },
    ]);
    setNewColumnTitle("");
    setAddingColumn(false);
  };

  const commitColumnTitle = (columnId: string) => {
    const next = draftTitle.trim();
    if (next) {
      setColumns((current) =>
        current.map((column) =>
          column.id === columnId ? { ...column, title: next } : column,
        ),
      );
    }
    setEditingColumnId(null);
    setDraftTitle("");
  };

  const commitCardTitle = (cardId: string) => {
    const next = draftTitle.trim();
    if (next) {
      setColumns((current) =>
        current.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.id === cardId ? { ...card, title: next } : card,
          ),
        })),
      );
    }
    setEditingCardId(null);
    setDraftTitle("");
  };

  const moveColumn = (targetColumnId: string) => {
    if (dragging?.kind !== "column" || dragging.columnId === targetColumnId) {
      setDragging(null);
      return;
    }
    setColumns((current) => {
      const next = [...current];
      const from = next.findIndex((column) => column.id === dragging.columnId);
      const to = next.findIndex((column) => column.id === targetColumnId);
      if (from < 0 || to < 0) return current;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragging(null);
  };

  const moveCard = (targetColumnId: string) => {
    if (dragging?.kind !== "card") return;
    setColumns((current) => {
      let moved: DemoKanbanCard | null = null;
      const without = current.map((column) => {
        if (column.id !== dragging.fromColumnId) return column;
        return {
          ...column,
          cards: column.cards.filter((card) => {
            if (card.id === dragging.cardId) {
              moved = card;
              return false;
            }
            return true;
          }),
        };
      });
      if (!moved) return current;
      const movedCard = moved as DemoKanbanCard;
      return without.map((column) =>
        column.id === targetColumnId
          ? { ...column, cards: [...column.cards, movedCard] }
          : column,
      );
    });
    setDragging(null);
  };

  if (!selectedBoard) {
    const boards = [
      {
        id: "mvp",
        title: "MVP push",
        description: "Launch board for the current Helm milestone.",
        color: "#a1bc98",
        count: columns.reduce((sum, column) => sum + column.cards.length, 0),
      },
      {
        id: "personal",
        title: "Personal tasks",
        description: "Errands, writing, admin, and loose ends.",
        color: "#9cc5c9",
        count: 9,
      },
      {
        id: "ops",
        title: "Ops queue",
        description: "Infrastructure maintenance and resource checks.",
        color: "#d4a373",
        count: 5,
      },
    ];

    return (
      <main className="flex min-w-0 flex-col overflow-hidden bg-background">
        <ModuleHeader
          icon={<LayoutGrid className="size-4" />}
          title="Kanban Boards"
          meta={`${boards.length} boards`}
          action={
            <Button size="sm" className="h-8">
              <Plus className="size-3.5" />
              New Board
            </Button>
          }
        />
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <div className="grid auto-rows-[12rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => setSelectedBoard(board.id)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition hover:shadow-md"
              >
                <div
                  className="h-16 shrink-0"
                  style={{
                    backgroundColor: board.color,
                    backgroundImage: `linear-gradient(135deg, ${board.color}ee, ${board.color}88)`,
                  }}
                />
                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {board.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {board.description}
                      </p>
                    </div>
                    <MoreHorizontal className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-auto pt-4 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {board.count} cards
                  </p>
                </div>
              </button>
            ))}
            <button
              type="button"
              className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span className="grid size-8 place-items-center rounded-full border-2 border-dashed">
                <Plus className="size-4" />
              </span>
              <span className="text-xs font-medium">New Board</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSelectedBoard(null)}
          title="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="size-3 rounded-full bg-accent" />
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">
          MVP push
        </h3>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto p-3 sm:p-4">
        <div className="flex h-full min-w-[52rem] items-start gap-4">
          {columns.map((column) => (
            <section
              key={column.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() =>
                dragging?.kind === "column"
                  ? moveColumn(column.id)
                  : moveCard(column.id)
              }
              className="flex max-h-full min-h-0 min-w-64 flex-1 flex-col rounded-2xl bg-secondary/60"
            >
              <div
                className="h-2 shrink-0 rounded-t-2xl"
                style={{ backgroundColor: column.color }}
              />
              <div
                draggable
                onDragStart={(event) => {
                  event.stopPropagation();
                  setDragging({ kind: "column", columnId: column.id });
                }}
                className="flex h-12 shrink-0 cursor-grab items-center gap-2 px-4"
              >
                {editingColumnId === column.id ? (
                  <Input
                    autoFocus
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={() => commitColumnTitle(column.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitColumnTitle(column.id);
                      if (event.key === "Escape") setEditingColumnId(null);
                    }}
                    className="h-7 flex-1 bg-background text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onDoubleClick={() => {
                      setEditingColumnId(column.id);
                      setDraftTitle(column.title);
                    }}
                    className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                    title="Double click to rename"
                  >
                    {column.title}
                  </button>
                )}
                <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {column.cards.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  onClick={() =>
                    setColumns((current) =>
                      current.filter((candidate) => candidate.id !== column.id),
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-6"
                  onClick={() => setAddingCardColumnId(column.id)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">
                {addingCardColumnId === column.id && (
                  <div className="rounded-xl border bg-card p-3 shadow-sm">
                    <Input
                      autoFocus
                      value={newCardTitle}
                      onChange={(event) => setNewCardTitle(event.target.value)}
                      placeholder="Card title..."
                      className="h-8 text-sm"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") addCard(column.id);
                        if (event.key === "Escape") setAddingCardColumnId(null);
                      }}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="h-7"
                        onClick={() => addCard(column.id)}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() => setAddingCardColumnId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {column.cards.map((card) => (
                  <article
                    key={card.id}
                    draggable
                    onDragStart={(event) => {
                      event.stopPropagation();
                      setDragging({
                        kind: "card",
                        cardId: card.id,
                        fromColumnId: column.id,
                      });
                    }}
                    className={cn(
                      "rounded-xl border bg-card p-3 shadow-sm",
                      card.done && "opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {editingCardId === card.id ? (
                        <Input
                          autoFocus
                          value={draftTitle}
                          onChange={(event) =>
                            setDraftTitle(event.target.value)
                          }
                          onBlur={() => commitCardTitle(card.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") commitCardTitle(card.id);
                            if (event.key === "Escape") setEditingCardId(null);
                          }}
                          className="h-7 flex-1 text-sm"
                        />
                      ) : (
                        <button
                          type="button"
                          onDoubleClick={() => {
                            setEditingCardId(card.id);
                            setDraftTitle(card.title);
                          }}
                          className={cn(
                            "min-w-0 flex-1 text-left text-sm font-medium leading-snug",
                            card.done && "line-through",
                          )}
                        >
                          {card.title}
                        </button>
                      )}
                      <span
                        className={cn(
                          "mt-1 size-2 shrink-0 rounded-full",
                          card.prio === "high"
                            ? "bg-destructive"
                            : card.prio === "med"
                              ? "bg-accent"
                              : "bg-muted-foreground/40",
                        )}
                        aria-label={`${card.prio} priority`}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <Badge variant="outline" className="h-5 px-1.5">
                        {card.tag}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {card.due && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {card.due}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setColumns((current) =>
                              current.map((candidate) => ({
                                ...candidate,
                                cards: candidate.cards.map((item) =>
                                  item.id === card.id
                                    ? { ...item, done: !item.done }
                                    : item,
                                ),
                              })),
                            )
                          }
                          className="rounded border px-1 py-0.5 hover:bg-muted"
                        >
                          {card.done ? "done" : "open"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setColumns((current) =>
                              current.map((candidate) => ({
                                ...candidate,
                                cards: candidate.cards.filter(
                                  (item) => item.id !== card.id,
                                ),
                              })),
                            )
                          }
                          className="rounded p-0.5 hover:bg-muted"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          <button
            type="button"
            onClick={() => setAddingColumn(true)}
            className="flex min-w-64 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40"
          >
            <Plus className="size-4" />
            Add column
          </button>
          {addingColumn && (
            <div className="min-w-64 rounded-lg border border-dashed bg-secondary/40 p-3">
              <Input
                autoFocus
                value={newColumnTitle}
                onChange={(event) => setNewColumnTitle(event.target.value)}
                placeholder="Column title..."
                className="h-8"
                onKeyDown={(event) => {
                  if (event.key === "Enter") addColumn();
                  if (event.key === "Escape") setAddingColumn(false);
                }}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="h-7"
                  disabled={!newColumnTitle.trim()}
                  onClick={addColumn}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  onClick={() => setAddingColumn(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CalendarDemoPage({
  eventsData,
}: {
  eventsData: TemporalDemoData["calendarEvents"];
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState(eventsData[0]);
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setMonth(currentMonth.getMonth() + monthOffset);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7;
  const cells = Array.from(
    { length: Math.ceil((startDow + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - startDow + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    },
  );
  const monthEvents = eventsData.filter(
    (event) => event.year === year && event.month === month,
  );

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <ModuleHeader
        icon={<CalendarIcon className="size-4" />}
        title="Calendar"
        meta="Month view · manual events"
        action={
          <Button size="sm" className="h-8">
            <Plus className="size-3.5" />
            Event
          </Button>
        }
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-h-0 overflow-auto p-3 sm:p-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <div />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMonthOffset((value) => value - 1)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <h4 className="min-w-40 text-center text-lg font-semibold">
                  {new Date(year, month, 1).toLocaleString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </h4>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMonthOffset((value) => value + 1)}
                >
                  <ArrowUpRight className="size-4 rotate-45" />
                </Button>
              </div>
              <div className="justify-self-end">
                {monthOffset !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMonthOffset(0)}
                  >
                    Today
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-b-0">
              <div className="grid min-w-[42rem] grid-cols-7">
                {CALENDAR_DAYS.map((day) => (
                  <div
                    key={day}
                    className="border-b border-r p-2 text-center text-sm font-medium"
                  >
                    {day}
                  </div>
                ))}
                {cells.map((day, index) => {
                  const dayEvents =
                    day === null
                      ? []
                      : monthEvents.filter((event) => event.date === day);
                  return (
                    <div
                      key={`${month}-${index}`}
                      className={cn(
                        "relative aspect-square min-h-24 border-b border-r p-1.5 pt-8",
                        day === null ? "bg-muted/30" : "hover:bg-accent/20",
                      )}
                    >
                      {day !== null && (
                        <>
                          <span
                            className={cn(
                              "absolute right-1 top-1 grid size-5 place-items-center rounded-full text-xs",
                              monthOffset === 0 &&
                                day === new Date().getDate() &&
                                "bg-accent-strong font-bold text-background",
                            )}
                          >
                            {day}
                          </span>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            {dayEvents.slice(0, 4).map((event) => (
                              <button
                                key={event.title}
                                type="button"
                                onClick={() => setSelected(event)}
                                className={cn(
                                  "truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight",
                                  event.kind === "personal"
                                    ? "bg-destructive text-white"
                                    : event.kind === "meet"
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-accent-strong text-background",
                                )}
                              >
                                <span className="opacity-70">
                                  {String(event.start).padStart(2, "0")}:00
                                </span>{" "}
                                {event.title}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <aside className="border-t bg-secondary/20 p-4 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Selected event
          </p>
          <h4 className="mt-2 text-lg font-semibold leading-tight">
            {selected.title}
          </h4>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock className="size-4" />
              {String(selected.start).padStart(2, "0")}:00 · {selected.span}h
            </p>
            <p className="flex items-center gap-2">
              <CalendarIcon className="size-4" />
              {CALENDAR_DAYS[selected.day]}, May {selected.day + 19}
            </p>
            <Badge variant="secondary">{selected.kind}</Badge>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PeopleDemoPage({
  peopleData,
}: {
  peopleData: TemporalDemoData["people"];
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("graph");
  const [selected, setSelected] = useState(peopleData[0]);
  const filtered = useMemo(
    () =>
      peopleData.filter((person) =>
        `${person.name} ${person.role}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [peopleData, query],
  );
  const peopleGraph = useMemo(() => {
    const groups: IPersonGroup[] = [
      {
        _id: "pg-founders",
        name: "Founders",
        color: "#a1bc98",
        autoCreated: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: "pg-investors",
        name: "Investors",
        color: "#d4a373",
        autoCreated: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: "pg-creative",
        name: "Creative network",
        color: "#9cc5c9",
        autoCreated: false,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const people: IPerson[] = peopleData.map((person, index) => ({
      _id: `person-${index}`,
      name: person.name,
      notes: `${person.role}. Last contact ${person.last}. Next action: ${person.next}.`,
      photos: [],
      groupIds:
        index === 0 || index === 5
          ? ["pg-founders"]
          : index === 2
            ? ["pg-investors"]
            : ["pg-creative"],
      socials: [],
      placeMet: "Helm demo network",
      createdAt: now,
      updatedAt: now,
    }));
    const visibleNames = new Set(filtered.map((person) => person.name));
    const visiblePeople = people.filter((person) =>
      visibleNames.has(person.name),
    );
    const visibleIds = new Set(visiblePeople.map((person) => person._id));
    const edges: IPersonEdge[] = [
      personEdge("pe-1", "person-0", "person-2", 0.8),
      personEdge("pe-2", "person-0", "person-5", 0.75),
      personEdge("pe-3", "person-1", "person-4", 0.65),
      personEdge("pe-4", "person-2", "person-3", 0.55),
      personEdge("pe-5", "person-3", "person-5", 0.6),
    ].filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to));
    const visibleGroupIds = new Set(
      visiblePeople.flatMap((person) => person.groupIds),
    );
    return {
      people,
      visiblePeople,
      groups: groups.filter((group) => visibleGroupIds.has(group._id)),
      edges,
    };
  }, [filtered, peopleData]);
  const getPersonLabel = useCallback((person: IPerson) => person.name, []);
  const getPersonGroupIds = useCallback(
    (person: IPerson) => person.groupIds,
    [],
  );
  const getPersonColor = useCallback(
    (person: IPerson, scheme: "dark" | "light") =>
      classColor(person.name, scheme),
    [],
  );
  const handleSelectGraphPerson = useCallback(
    (person: IPerson) => {
      const match = peopleData.find(
        (candidate) => candidate.name === person.name,
      );
      if (match) setSelected(match);
    },
    [peopleData],
  );
  const ignoreGraphGroup = useCallback(() => {}, []);

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <ModuleHeader
        icon={<Users className="size-4" />}
        title="People"
        meta={`${filtered.length} / ${peopleData.length} contacts`}
        action={
          <Button size="sm" className="h-8">
            <Plus className="size-3.5" />
            Person
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, notes, place..."
            className="h-8 pl-7 text-xs"
          />
        </div>
        <Tabs value={view} onValueChange={(value) => setView(value as View)}>
          <TabsList className="h-8">
            <TabsTrigger value="graph" className="h-6 px-2 text-xs">
              <LayoutGrid className="size-3.5" />
            </TabsTrigger>
            <TabsTrigger value="list" className="h-6 px-2 text-xs">
              <List className="size-3.5" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setQuery("")}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="flex min-h-0 flex-col">
          {view === "graph" ? (
            <EntityGraph
              items={peopleGraph.visiblePeople}
              groups={peopleGraph.groups}
              edges={peopleGraph.edges}
              getItemLabel={getPersonLabel}
              getItemGroupIds={getPersonGroupIds}
              getItemColor={getPersonColor}
              itemValBase={1.2}
              itemValPerConnection={0.35}
              onSelectItem={handleSelectGraphPerson}
              onSelectGroup={ignoreGraphGroup}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-auto divide-y">
              {filtered.map((person) => (
                <button
                  key={person.name}
                  type="button"
                  onClick={() => setSelected(person)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40",
                    selected.name === person.name && "bg-muted/50",
                  )}
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {initials(person.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {person.role}
                    </p>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {person.next}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
        <aside className="border-t bg-secondary/20 p-5 lg:border-l lg:border-t-0">
          <div className="grid size-14 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(selected.name)}
          </div>
          <h4 className="mt-4 text-xl font-semibold">{selected.name}</h4>
          <p className="text-sm text-muted-foreground">{selected.role}</p>
          <div className="mt-5 divide-y border-y text-xs">
            <MiniRow label="last_contact">{selected.last}</MiniRow>
            <MiniRow label="birthday">{selected.birthdayLabel}</MiniRow>
            <MiniRow label="next_action">{selected.next}</MiniRow>
            <MiniRow label="group">Demo network</MiniRow>
            <MiniRow label="notes">
              Met through the Helm feedback loop. Follow up with a concise
              update and one concrete ask.
            </MiniRow>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InboxDemoPage({
  inboxesData,
}: {
  inboxesData: TemporalDemoData["inboxes"];
}) {
  const accounts = [
    { id: "work", user: "deniz@helm.local", host: "imap.helm.local" },
    { id: "personal", user: "me@example.com", host: "imap.example.com" },
  ];
  const [accountId, setAccountId] = useState(accounts[0].id);
  const emailsData = inboxesData[accountId as keyof typeof inboxesData];
  const [selected, setSelected] = useState(emailsData[0]);
  const [approved, setApproved] = useState(false);
  const selectedAccount = accounts.find((account) => account.id === accountId)!;

  return (
    <main className="grid min-w-0 grid-cols-1 overflow-hidden bg-background lg:grid-cols-[13rem_minmax(18rem,24rem)_minmax(0,1fr)]">
      <aside className="hidden border-r bg-secondary/20 p-2 lg:block">
        <div className="flex h-10 items-center justify-between px-2">
          <span className="text-xs font-medium">Accounts</span>
          <Button size="icon-sm" variant="ghost">
            <Plus className="size-3.5" />
          </Button>
        </div>
        <div className="space-y-1">
          {accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => {
                setAccountId(account.id);
                setSelected(
                  inboxesData[account.id as keyof typeof inboxesData][0],
                );
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-card",
                accountId === account.id && "bg-card shadow-sm",
              )}
            >
              <Mail className="size-3.5 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{account.user}</span>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex min-h-0 flex-col border-r-0 lg:border-r">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <Mail className="size-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {selectedAccount.user}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {selectedAccount.host}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm">
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
        <div className="min-h-0 overflow-auto">
          {emailsData.map((email) => (
            <button
              key={email.subject}
              type="button"
              onClick={() => setSelected(email)}
              className={cn(
                "block w-full border-b px-4 py-3 text-left hover:bg-muted/40",
                selected.subject === email.subject && "bg-muted/50",
              )}
            >
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                  {email.from}
                </p>
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {email.tag}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm">{email.subject}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {email.snippet}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                {email.received}
              </p>
            </button>
          ))}
        </div>
      </section>
      <article className="min-h-0 overflow-auto p-5">
        <div className="mb-4 flex justify-end">
          <Button size="sm" className="h-8">
            <Pencil className="size-3.5" />
            Compose
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {selected.from} · {selected.address}
        </p>
        <h4 className="mt-2 text-2xl font-semibold leading-tight">
          {selected.subject}
        </h4>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/85">
          {selected.snippet} This message has been summarized in the triage
          view, with a suggested next action waiting for approval.
        </p>
        <div className="mt-6 rounded-lg border bg-secondary/25 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Suggested action
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">{selected.suggested}</p>
            <Button size="sm" onClick={() => setApproved(true)}>
              <Check className="size-3.5" />
              {approved ? "Accepted" : "Accept"}
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
}

function ResourcesDemoPage({
  resourcesData,
}: {
  resourcesData: TemporalDemoData["resources"];
}) {
  const [resources, setResources] = useState(resourcesData);
  const [selected, setSelected] = useState(resourcesData[0]);
  const [detailOpen, setDetailOpen] = useState(false);

  const checkAll = () => {
    setResources((current) =>
      current.map((resource) => ({
        ...resource,
        cpu: Math.min(94, resource.cpu + (resource.status === "warn" ? -6 : 3)),
      })),
    );
  };

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <ModuleHeader
        icon={<Server className="size-4" />}
        title="Resources"
        meta={`${resources.length} hosts · monitoring`}
        action={
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={checkAll}
          >
            <Activity className="size-3.5" />
            Check all
          </Button>
        }
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-h-0 overflow-auto divide-y">
          {resources.map((resource) => (
            <button
              type="button"
              key={resource.name}
              onClick={() => {
                setSelected(resource);
                setDetailOpen(true);
              }}
              className={cn(
                "group grid w-full gap-3 border-b border-border/50 px-4 py-3 text-left transition hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_8rem_6rem_6rem_2rem]",
                selected.name === resource.name && "bg-muted/50",
              )}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <StatusDot status={resource.status} />
                  <span className="truncate">{resource.name}</span>
                  <span className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {resource.role.includes("API")
                      ? "API"
                      : resource.role.includes("Redis")
                        ? "SVC"
                        : "VPS"}
                  </span>
                </p>
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground/70">
                  https://{resource.name}.helm.local
                </p>
              </div>
              <UptimeSparkline status={resource.status} />
              <Meter label="CPU" value={resource.cpu} />
              <Meter label="RAM" value={resource.ram} />
              <MoreHorizontal className="mt-1 size-4 opacity-0 transition group-hover:opacity-100" />
            </button>
          ))}
        </section>
        <aside
          className={cn(
            "border-t bg-secondary/20 p-5 lg:border-l lg:border-t-0",
            !detailOpen && "hidden lg:block",
          )}
        >
          <div className="flex items-center gap-2">
            <StatusDot status={selected.status} />
            <h4 className="text-lg font-semibold">{selected.name}</h4>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{selected.role}</p>
          <div className="mt-5 space-y-3">
            <Meter label="CPU" value={selected.cpu} wide />
            <Meter label="RAM" value={selected.ram} wide />
            <Meter
              label="Disk"
              value={selected.status === "warn" ? 86 : 38}
              wide
            />
          </div>
          <div className="mt-5 divide-y border-y text-xs">
            <MiniRow label="agent">
              {selected.status === "ok" ? "healthy" : "degraded"}
            </MiniRow>
            <MiniRow label="checked">{selected.lastChecked}</MiniRow>
            <MiniRow label="checks">24 / 24 today</MiniRow>
            <MiniRow label="caps">shell, metrics, cron</MiniRow>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 w-full justify-between"
            onClick={() => setDetailOpen(false)}
          >
            Open resource
            <ArrowUpRight className="size-3.5" />
          </Button>
        </aside>
      </div>
    </main>
  );
}

function AssistantDemoPage({
  transcript,
  tools,
}: {
  transcript: AssistantMessageSeed[];
  tools: string[];
}) {
  const [approvalState, setApprovalState] = useState<
    "idle" | "approving" | "approved"
  >("idle");
  const approved = approvalState === "approved";

  const approve = () => {
    setApprovalState("approving");
    window.setTimeout(() => setApprovalState("approved"), 900);
  };

  return (
    <main className="flex min-w-0 flex-col overflow-hidden bg-background">
      <ModuleHeader
        icon={<Sparkles className="size-4" />}
        title="Assistant"
        meta="Workspace-aware operator"
        action={<Badge variant="outline">approval required</Badge>}
      />
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-h-0 overflow-auto p-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {transcript.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg p-3.5 text-sm leading-relaxed",
                  message.who === "you"
                    ? "ml-8 bg-primary text-primary-foreground"
                    : "mr-8 border bg-card",
                )}
              >
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-70">
                  {message.who === "you" ? "You" : "Helm"}
                </p>
                <p>{message.text}</p>
                {message.approval && (
                  <div className="mt-3 rounded-md border border-destructive/40 bg-background p-3 text-foreground">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-destructive">
                      High-risk action
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm">{message.approval.label}</p>
                      <Button
                        size="sm"
                        onClick={approve}
                        disabled={approvalState !== "idle"}
                      >
                        {approvalState === "approving" ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Approving
                          </>
                        ) : approvalState === "approved" ? (
                          <>
                            <CheckCircle2 className="size-3.5" />
                            Accepted
                          </>
                        ) : (
                          <>
                            <Check className="size-3.5" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {approved && (
              <div className="mr-8 rounded-lg border bg-card p-3.5 text-sm">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Helm
                </p>
                Sent. Logged to audit as evt_demo_042.
              </div>
            )}
          </div>
        </section>
        <aside className="border-t bg-secondary/20 p-4 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Tools
          </p>
          <div className="mt-3 space-y-1.5 font-mono text-xs">
            {tools.map((tool) => (
              <div
                key={tool}
                className="flex items-center justify-between rounded-md border bg-background px-2.5 py-1.5"
              >
                <span>{tool}</span>
                {(tool.includes("send") || tool.includes("restart")) && (
                  <TriangleAlert className="size-3 text-destructive" />
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function ModuleHeader({
  icon,
  title,
  meta,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-b px-3 py-3 sm:h-12 sm:flex-row sm:items-center sm:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="truncate text-sm font-medium">{title}</h3>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          {meta}
        </span>
      </div>
      {action}
    </div>
  );
}

function MiniRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2 px-2 py-2">
      <span className="font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function Meter({
  label,
  value,
  wide,
}: {
  label: string;
  value: number;
  wide?: boolean;
}) {
  const warn = value > 75;
  return (
    <div className={cn("min-w-0", wide && "w-full")}>
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
        <div
          className={cn("h-full", warn ? "bg-destructive" : "bg-primary")}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "ok" | "warn" }) {
  return (
    <span
      className={cn(
        "size-2 shrink-0 rounded-full",
        status === "ok" ? "bg-accent" : "bg-destructive",
      )}
    />
  );
}

function UptimeSparkline({ status }: { status: "ok" | "warn" }) {
  return (
    <div className="hidden items-center gap-0.5 sm:flex" aria-label="uptime">
      {Array.from({ length: 18 }).map((_, index) => {
        const degraded = status === "warn" && index > 12 && index < 16;
        return (
          <span
            key={index}
            className={cn(
              "h-5 w-1 rounded-full",
              degraded ? "bg-destructive/75" : "bg-accent",
            )}
          />
        );
      })}
    </div>
  );
}

function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 px-2 py-1.5 sm:grid-cols-[8.75rem_minmax(0,1fr)]">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="font-mono text-[11px]">{label}</span>
      </div>
      <div className="min-w-0 text-xs">{children}</div>
    </div>
  );
}

function note({
  id,
  title,
  content,
  description,
  tags,
  groupIds,
  className,
  updatedAt,
}: {
  id: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  groupIds: string[];
  className: string;
  updatedAt: string;
}): INote {
  return {
    _id: id,
    title,
    content,
    description,
    tags,
    groupIds,
    class: className,
    status: "open",
    createdAt: updatedAt,
    updatedAt,
  };
}

function group(
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
    createdAt: now,
    updatedAt: now,
  };
}

function edge(
  id: string,
  from: string,
  to: string,
  strength: number,
): INoteEdge {
  return {
    _id: id,
    from,
    to,
    strength,
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };
}

function personEdge(
  id: string,
  from: string,
  to: string,
  strength: number,
): IPersonEdge {
  return {
    _id: id,
    from,
    to,
    strength,
    createdAt: now,
    updatedAt: now,
  };
}

function sortNotes(notes: INote[], sort: Sort) {
  return [...notes].sort((left, right) => {
    switch (sort) {
      case "updated-asc":
        return (
          new Date(left.updatedAt).getTime() -
          new Date(right.updatedAt).getTime()
        );
      case "title-asc":
        return left.title.localeCompare(right.title);
      case "title-desc":
        return right.title.localeCompare(left.title);
      default:
        return (
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime()
        );
    }
  });
}

function collectVisibleGroups(notes: INote[], groups: INoteGroup[]) {
  const byId = new Map(groups.map((group) => [group._id, group]));
  const visible = new Set<string>();

  for (const item of notes) {
    for (const groupId of item.groupIds ?? []) {
      let currentId: string | null | undefined = groupId;
      while (currentId) {
        if (visible.has(currentId)) break;
        visible.add(currentId);
        currentId = byId.get(currentId)?.parentId ?? null;
      }
    }
  }

  return groups.filter((groupItem) => visible.has(groupItem._id));
}

function formatDate(value: string | Date | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
