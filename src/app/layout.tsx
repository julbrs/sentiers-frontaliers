import type { Metadata } from "next";
import "./globals.css";

import Header from "@/app/header";
import { Footer } from "./footer";

export const metadata: Metadata = {
  title: "Finances Sentiers Frontaliers - Réseau de Sentiers",
  description:
    "Gestion financière d'un réseau de 140+ km de sentiers de randonnée entre le Canada et les USA",
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
      </body>
    </html>
  );
}
