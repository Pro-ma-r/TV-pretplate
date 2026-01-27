import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  await supabase.auth.signOut();

  // ⬇️ KLJUČ: 303 umjesto default 307
  return NextResponse.redirect(
    new URL("/login", request.url),
    { status: 303 }
  );
}
