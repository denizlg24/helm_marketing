import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <p className="text-sm tracking-widest uppercase text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-medium">Page not found</h1>
        <p className="text-muted-foreground">
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-sm underline underline-offset-4 hover:no-underline"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
