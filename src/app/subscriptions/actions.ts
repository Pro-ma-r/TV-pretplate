"use server";

import { supabaseServer } from "@/src/lib/supabaseServer";

export async function disableSubscription(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = await supabaseServer();
  await sb.rpc("disable_subscription", {
    p_subscription_id: id,
    p_reason: "Isključeno iz admin panela"
  });
}

export async function enableSubscription(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const sb = await supabaseServer();
  await sb.rpc("enable_subscription", {
    p_subscription_id: id
  });
}

export async function createSubscription(formData: FormData) {
  const sb = await supabaseServer();

  await sb.rpc("create_subscription", {
    p_brand_id: formData.get("brand_id"),
    p_package_id: formData.get("package_id"),
    p_start_date: formData.get("start_date"),
    p_end_date: formData.get("end_date"),
    p_payment_date: formData.get("payment_date") ?? null,
    p_note: formData.get("note") ?? null
  });
}
