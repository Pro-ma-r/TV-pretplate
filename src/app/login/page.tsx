"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const login = async () => {
    setErr(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
    else router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="text-xl font-semibold">Prijava</div>
        <div className="mt-1 text-sm text-zinc-400">Interni sustav pretplata</div>

        <div className="mt-6 grid gap-3">
          <input className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" placeholder="Lozinka" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800">
            Ulogiraj se
          </button>
          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>
      </div>
    </div>
  );
}
