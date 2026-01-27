"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabaseBrowser";

export default function BrandToggle({
  brandId,
  disabled,
  brandName
}: {
  brandId: string;
  disabled: boolean;
  brandName: string;
}) {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [toast, setToast] = useState<string | null>(null);

  async function toggle() {
    if (!disabled) {
      const ok = confirm(
        `Jesi li siguran da želiš isključiti brend "${brandName}"?`
      );
      if (!ok) return;
    }

    await sb
      .from("subscriptions")
      .update({ manually_disabled: !disabled })
      .eq("brand_id", brandId);

    setToast(
      disabled
        ? `Brend "${brandName}" je uključen.`
        : `Brend "${brandName}" je isključen.`
    );

    router.refresh();
  }

  return (
    <>
      {toast && (
        <div className="mb-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs">
          {toast}
        </div>
      )}

      <button
        onClick={toggle}
        className={`rounded-lg px-3 py-1 text-sm ${
          disabled
            ? "bg-green-600/20 text-green-400 border border-green-600/40"
            : "bg-red-600/20 text-red-400 border border-red-600/40"
        }`}
      >
        {disabled ? "Uključi brend" : "Isključi brend"}
      </button>
    </>
  );
}
