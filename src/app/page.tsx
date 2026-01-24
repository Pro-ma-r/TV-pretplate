import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function Home() {
  // ⬅️ jedna Supabase instanca
  const supabase = await supabaseServer();

  // ⬅️ requireUser koristi istu instancu
  const u = await requireUser(supabase);

  if (!u) redirect("/login");

  redirect("/dashboard");
}
