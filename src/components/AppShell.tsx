import Link from "next/link";

export function AppShell({
  title,
  role,
  children
}: {
  title: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-zinc-800" />
            <div>
              <div className="text-sm text-zinc-400">Tvornica vjenčanja</div>
              <div className="text-lg font-semibold">{title}</div>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:text-white text-zinc-300" href="/dashboard">Dashboard</Link>
            <Link className="hover:text-white text-zinc-300" href="/subscriptions">Pretplate</Link>
            <Link className="hover:text-white text-zinc-300" href="/reports">Izvještaji</Link>
            <span className="ml-4 rounded-full border border-zinc-800 px-3 py-1 text-zinc-300">
              {role.toUpperCase()}
            </span>
            <Link className="hover:text-white text-zinc-300" href="/logout">Logout</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
