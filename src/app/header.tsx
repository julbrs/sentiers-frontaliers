"use client";

import { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, Mountain, User, Shield, ChevronDown } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = (
    data as { user?: { name?: string | null; email?: string | null; role?: string } } | null
  )?.user;
  const displayName = user?.name || user?.email || "Profil";
  const isAdmin = user?.role === "admin";

  async function handleLogout() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      await refetch();
    } finally {
      setSigningOut(false);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 hover:bg-white/25 transition-colors"
      >
        <User size={16} />
        <span className="text-sm font-medium leading-none">{displayName}</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform", dropdownOpen && "rotate-180")}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white text-gray-900 shadow-xl z-50">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">{displayName}</p>
            {isAdmin && <p className="text-xs text-emerald-600 font-semibold">Administrateur</p>}
          </div>

          <div className="py-1">
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-emerald-50 transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Shield size={16} className="text-emerald-600" />
                  Tableau de bord admin
                </Link>
                <hr className="my-1" />
              </>
            )}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              <User size={16} />
              Mon profil
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setDropdownOpen(false);
              }}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors text-left disabled:opacity-70"
            >
              <LogOut size={16} />
              {signingOut ? "Déconnexion..." : "Déconnexion"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
