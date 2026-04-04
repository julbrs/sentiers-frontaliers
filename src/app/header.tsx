"use client";

import { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, User, Shield, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header className="bg-linear-to-r from-(--sf-red-700) to-(--sf-red-800) text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/chevron.png" alt="Sentiers Frontaliers" height={50} width={50} />
          <span className="text-lg font-semibold font-(family-name:--font-display)">
            Mon espace membre SF
          </span>
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
      <Button
        asChild
        variant="secondary"
        className="bg-white text-(--sf-red-700) hover:bg-(--sf-off-white)"
      >
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
            {isAdmin && <p className="text-xs text-(--sf-red-700) font-semibold">Administrateur</p>}
          </div>

          <div className="py-1">
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-(--sf-off-white) transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Shield size={16} className="text-(--sf-red-700)" />
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
