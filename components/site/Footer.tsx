import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-12">
        <div className="md:col-span-8">
          <Wordmark />
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            The console for the life you&apos;re actually running.
          </p>
        </div>
        <FooterCol
          title="Sections"
          links={[
            ["Demo", "#demo"],
            ["Modules", "#modules"],
            ["Assistant", "#assistant"],
            ["Principles", "#principles"],
          ]}
        />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground md:flex-row">
          <span>© 2026 Helm.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div className="md:col-span-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href as any}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
