import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  const role =
    (data.user.user_metadata?.role as string | undefined) ?? "user";

  return { user: data.user, role };
}
