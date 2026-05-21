import Link from "next/link";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "#demo", label: "Demo" },
  { href: "#modules", label: "Modules" },
  { href: "#assistant", label: "Assistant" },
  { href: "#principles", label: "Principles" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Helm — home">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm text-muted-foreground">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href as any}
                  className="transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <span className="w-7" aria-hidden />
      </div>
    </header>
  );
}
