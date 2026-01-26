import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  );

  await supabase.auth.signOut();

  res.setHeader(
    "Set-Cookie",
    "sb-access-token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );

  res.redirect("/login");
}
