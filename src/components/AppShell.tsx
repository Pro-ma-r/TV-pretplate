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
          {/* LEFT: LOGO + TITLE */}
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl p-1 flex items-center justify-center"
              style={{ backgroundColor: "#E4CEFB" }}
            >
              <img
                src="https://lbusgwzwobefmobdvlde.supabase.co/storage/v1/object/public/misc/logo.png"
                alt="Tvornica vjenčanja"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <div className="text-sm text-zinc-400">
                Tvornica vjenčanja
              </div>
              <div className="text-lg font-semibold">
                {title}
              </div>
            </div>
          </div>

          {/* RIGHT: NAV */}
          <nav className="flex items-center gap-4 text-sm">
            <Link
              className="text-zinc-300 hover:text-white transition"
              href="/dashboard"
            >
              Dashboard
            </Link>

            <Link
              className="text-zinc-300 hover:text-white transition"
              href="/subscriptions"
            >
              Pretplate
            </Link>

            <Link
              className="text-zinc-300 hover:text-white transition"
              href="/reports"
            >
              Izvještaji
            </Link>

            <span className="ml-4 rounded-full border border-zinc-800 px-3 py-1 text-zinc-300">
              {role.toUpperCase()}
            </span>

            <Link
              className="text-zinc-300 hover:text-white transition"
              href="/logout"
            >
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
