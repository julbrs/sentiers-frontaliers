import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";

import Header from "@/app/header";
import { Footer } from "./footer";
import { Toaster } from "@/components/ui/sonner";

const displayFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mon espace membre SF",
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
      <body
        className={`${displayFont.variable} ${bodyFont.variable} font-(family-name:--font-body)`}
      >
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
