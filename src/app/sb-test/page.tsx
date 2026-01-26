import { supabaseServer } from "@/src/lib/supabaseServer";

export default async function SupabaseTestPage() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("brands")
    .select("id")
    .limit(1);

  return (
    <div style={{ padding: 40 }}>
      <h1>SUPABASE TEST</h1>

      {error ? (
        <pre style={{ color: "red" }}>
          ERROR: {JSON.stringify(error, null, 2)}
        </pre>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
