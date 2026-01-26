import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  // ✅ Next 15: cookies() je async
  const cookieStore = await cookies();

  // ⚠️ TYPE CAST je NUŽAN (Next 15 vs Supabase SSR mismatch)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: any[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    } as any
  );

  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
