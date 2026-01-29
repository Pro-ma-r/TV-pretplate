import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Tvornica vjenčanja – Admin",
  description: "Interni sustav pretplata",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="hr">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
