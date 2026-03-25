import type { Metadata } from "next";
import "./globals.css";

import Header from "@/app/header";
import { Footer } from "./footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Mon Sentiers Frontaliers",
  description:
    "Gérez votre adhésion, consultez l'historique de vos commandes et restez informé des dernières nouvelles concernant les Sentiers Frontaliers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="flex flex-col min-h-screen bg-stone-50">
          <main className="grow">
            <Header />
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
