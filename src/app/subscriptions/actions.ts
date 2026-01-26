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

export async function createSubscription(payload: {
  brand_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  payment_date?: string;
  note?: string;
}) {
  const sb = await supabaseServer();
  await sb.rpc("create_subscription", {
    p_brand_id: payload.brand_id,
    p_package_id: payload.package_id,
    p_start_date: payload.start_date,
    p_end_date: payload.end_date,
    p_payment_date: payload.payment_date ?? null,
    p_note: payload.note ?? null
  });
}
