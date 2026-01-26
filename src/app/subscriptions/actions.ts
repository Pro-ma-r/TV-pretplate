"use server";

import { supabaseServer } from "@/src/lib/supabaseServer";

export async function disableSubscription(id: string) {
  const sb = await supabaseServer();
  await sb.rpc("disable_subscription", {
    p_subscription_id: id,
    p_reason: "Isključeno iz admin panela"
  });
}

export async function enableSubscription(id: string) {
  const sb = await supabaseServer();
  await sb.rpc("enable_subscription", {
    p_subscription_id: id
  });
}
