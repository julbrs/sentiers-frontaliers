"use client";

import { useState } from "react";
import { LogIn, LogOut, Mountain, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <Link href="/">
          <div className="flex items-center space-x-3">
            <Mountain size={32} className="text-amber-300" />
            <div>
              <h1 className="text-2xl font-bold">Sentiers Frontaliers</h1>
              <p className="text-sm text-emerald-100">Finances - Trail Network</p>
            </div>
          </div>
        </Link>

        <UserButton />
      </div>
    </header>
  );
}

function UserButton() {
  const { data, isPending, isRefetching, refetch } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  const user = (data as { user?: { name?: string | null; email?: string | null } } | null)?.user;
  const displayName = user?.name || user?.email || "Profil";

  async function handleLogout() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      await refetch();
    } finally {
      setSigningOut(false);
    }
  }

  if (isPending || isRefetching) {
    return (
      <div className="h-10 w-32 rounded-md bg-white/20 animate-pulse" aria-label="Chargement" />
    );
  }

  if (!user) {
    return (
      <Button asChild variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50">
        <Link href="/login" className="flex items-center gap-2">
          <LogIn size={16} />
          Connexion
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
        <User size={16} />
        <span className="text-sm font-medium leading-none">{displayName}</span>
      </div>
      <Button
        onClick={handleLogout}
        size="sm"
        variant="secondary"
        disabled={signingOut}
        className={cn("bg-white text-emerald-700 hover:bg-emerald-50", signingOut && "opacity-70")}
      >
        <LogOut size={14} className="mr-2" />
        {signingOut ? "Déconnexion..." : "Déconnexion"}
      </Button>
    </div>
  );
}
