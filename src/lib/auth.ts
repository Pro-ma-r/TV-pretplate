import { supabaseServer } from "./supabaseServer";

export async function requireUser() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const role = (data.user.user_metadata?.role as string | undefined) ?? "user";
  return { user: data.user, role };
}
