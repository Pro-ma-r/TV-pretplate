import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  await supabase.auth.signOut();

  const response = NextResponse.redirect(
    new URL("/login", request.url)
  );

  // 🔑 eksplicitno brišemo supabase cookie (sigurnosno)
  response.cookies.set("sb-access-token", "", {
    path: "/",
    maxAge: 0
  });
  response.cookies.set("sb-refresh-token", "", {
    path: "/",
    maxAge: 0
  });

  return response;
}
