"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import {
  CalendarDays,
  CornerDownLeft,
  FileText,
  Inbox,
  KanbanSquare,
  Search,
  Server,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ModuleKey } from "@/lib/marketing";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (k: ModuleKey) => void;
};

export function CommandPalette({ open, onOpenChange, onNavigate }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const go = (k: ModuleKey) => {
    onNavigate(k);
    onOpenChange(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 sm:pt-32"
    >
      <button
        type="button"
        aria-label="Close palette"
        className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <Command
        label="Command palette"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_30px_80px_-20px_rgba(48,54,48,0.5)]"
        loop
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-4">
          <Search className="size-4 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Search modules, jump anywhere…"
            className="flex h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Kbd>esc</Kbd>
        </div>
        <Command.List className="max-h-[360px] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            Nothing matches that.
          </Command.Empty>

          <Command.Group
            heading="Modules"
            className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            <Item icon={FileText} label="Notes" hint="N" onSelect={() => go("notes")} />
            <Item icon={KanbanSquare} label="Tasks" hint="T" onSelect={() => go("kanban")} />
            <Item icon={CalendarDays} label="Calendar" hint="C" onSelect={() => go("calendar")} />
            <Item icon={Users} label="People" hint="P" onSelect={() => go("people")} />
            <Item icon={Inbox} label="Inbox" hint="I" onSelect={() => go("inbox")} />
            <Item icon={Server} label="Resources" hint="R" onSelect={() => go("resources")} />
            <Item icon={Sparkles} label="Assistant" hint="A" onSelect={() => go("assistant")} />
          </Command.Group>

          <Command.Group
            heading="Actions"
            className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            <Item icon={Sparkles} label="Ask the assistant…" sub="What did I commit to this week?" onSelect={() => go("assistant")} />
            <Item icon={FileText} label="New note" onSelect={() => go("notes")} />
            <Item icon={KanbanSquare} label="New task" onSelect={() => go("kanban")} />
            <Item icon={CalendarDays} label="New event" onSelect={() => go("calendar")} />
            <Item icon={Settings} label="Workspace settings" onSelect={() => onOpenChange(false)} />
          </Command.Group>
        </Command.List>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/50 px-3 py-2 text-[10.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>
              <CornerDownLeft className="size-3" />
            </Kbd>
            to select
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘P</Kbd> to toggle
          </span>
        </div>
      </Command>
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  sub,
  hint,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground",
        "aria-selected:bg-secondary/80 aria-selected:text-foreground",
        "data-[selected=true]:bg-secondary/80",
      )}
    >
      <Icon className="size-4 text-muted-foreground" />
      <span className="flex-1 truncate">{label}</span>
      {sub && (
        <span className="truncate text-xs text-muted-foreground">{sub}</span>
      )}
      {hint && <Kbd>{hint}</Kbd>}
    </Command.Item>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border/70 bg-background px-1 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}
