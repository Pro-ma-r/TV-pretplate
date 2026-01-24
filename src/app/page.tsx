import { requireUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const u = await requireUser();
  if (!u) redirect("/login");
  redirect("/dashboard");
}
