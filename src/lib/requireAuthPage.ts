import { redirect } from "next/navigation";
import { supabaseServer } from "./supabaseServer";
import { requireUser } from "./requireUser";

/**
 * Ovo se zove NA POČETKU SVAKOG PROTECTED PAGE-A
 * Ako nema usera → redirect na /login
 * Ako ima → vrati user + role
 */
export async function requireAuthPage() {
  const supabase = await supabaseServer();
  const session = await requireUser(supabase);

  if (!session) {
    redirect("/login");
  }

  return session;
}
