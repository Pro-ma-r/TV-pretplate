import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  // Supabase SSR client sam briše sve auth cookieje
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL("/login", request.url)
  );
}
