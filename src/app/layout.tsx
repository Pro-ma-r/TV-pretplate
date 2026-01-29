import "./globals.css";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "../lib/supabaseServer";
import { headers } from "next/headers";

export const metadata = {
  title: "Tvornica vjenčanja – Admin",
  description: "Interni sustav pretplata",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = headers().get("x-pathname");

  // JAVNE RUTE – bez auth checka
  if (
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/logout") ||
    pathname === "/"
  ) {
    return (
      <html lang="hr">
        <body className="min-h-screen bg-zinc-950 text-zinc-100">
          {children}
        </body>
      </html>
    );
  }

  // AUTH CHECK ZA SVE OSTALO
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="hr">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
