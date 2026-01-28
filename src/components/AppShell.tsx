"use client";

import Link from "next/link";
import { useState } from "react";

export function AppShell({
  title,
  role,
  children
}: {
  title: string;
  role: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* LEFT: LOGO + TITLE */}
          <div className="flex items-center gap-3">
            <img
              src="https://lbusgwzwobefmobdvlde.supabase.co/storage/v1/object/public/misc/logo.png"
              alt="Tvornica vjenčanja"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            />

            <div>
              <div className="text-xs sm:text-sm text-zinc-400">
                Tvornica vjenčanja
              </div>
              <div className="text-base sm:text-lg font-semibold">
                {title}
              </div>
            </div>
          </div>

          {/* RIGHT: DESKTOP NAV */}
          <nav className="hidden items-center gap-4 text-sm sm:flex">
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

            {/* ADMIN: NOVI KLIJENT */}
            {isAdmin && (
              <Link
                href="/clients/new"
                className="ml-2 rounded-lg border border-green-600/40 bg-green-600/20 px-3 py-1 text-xs sm:text-sm text-green-400 hover:bg-green-600/30 transition"
              >
                + Novi klijent
              </Link>
            )}

            <span className="ml-4 rounded-full border border-zinc-800 px-3 py-1 text-xs sm:text-sm text-zinc-300">
              {role.toUpperCase()}
            </span>

            <form action="/logout" method="POST">
              <button
                type="submit"
                className="text-zinc-300 hover:text-white transition"
              >
                Logout
              </button>
            </form>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-300 sm:hidden"
          >
            ☰
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {open && (
          <div className="border-t border-zinc-800 bg-zinc-950 sm:hidden">
            <nav className="flex flex-col gap-2 px-4 py-3 text-sm">
              <Link
                href="/dashboard"
                className="text-zinc-300 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/subscriptions"
                className="text-zinc-300 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Pretplate
              </Link>

              <Link
                href="/reports"
                className="text-zinc-300 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Izvještaji
              </Link>

              {/* ADMIN: NOVI KLIJENT (MOBILE) */}
              {isAdmin && (
                <Link
                  href="/clients/new"
                  className="mt-2 rounded-lg border border-green-600/40 bg-green-600/20 px-3 py-2 text-green-400"
                  onClick={() => setOpen(false)}
                >
                  + Novi klijent
                </Link>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-3">
                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {role.toUpperCase()}
                </span>

                <form action="/logout" method="POST">
                  <button
                    type="submit"
                    className="text-zinc-300 hover:text-white transition"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
