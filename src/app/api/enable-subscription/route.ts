import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json(
        { error: "Missing subscription id" },
        { status: 400 }
      );
    }

    // auth (samo ulogirani)
    const supabase = await supabaseServer();
    const u = await requireUser(supabase);

    if (!u) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // enable subscription
    const { error } = await supabase.rpc("enable_subscription", {
      p_subscription_id: id
    });

    if (error) {
      console.error("enable_subscription error:", error);
      return NextResponse.json(
        { error: "Failed to enable subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
