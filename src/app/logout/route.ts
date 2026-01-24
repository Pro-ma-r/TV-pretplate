import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";

export async function GET() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
