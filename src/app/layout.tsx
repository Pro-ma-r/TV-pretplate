import "./globals.css";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "../lib/supabaseServer";

export const metadata = {
  title: "Tvornica vjenčanja – Admin",
  description: "Interni sustav pretplata",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // POKUŠAJ auth, ali NIKAD ne smije srušiti app
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Ako nema usera → login
    if (!user) {
      redirect("/login");
    }
  } catch {
    // Ako auth uopće ne može raditi (favicon, cold start, /)
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
