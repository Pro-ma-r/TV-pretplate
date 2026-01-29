"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function deleteSubscription(formData: FormData) {
  const id = formData.get("id") as string | null;
  if (!id) return;

  await supabaseAdmin.from("subscriptions").delete().eq("id", id);
}
