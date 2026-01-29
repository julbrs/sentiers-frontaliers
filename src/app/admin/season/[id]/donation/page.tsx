"use client";

import { useEffect, useState } from "react";
import { HandHeart } from "lucide-react";
import { getSeasonById } from "@/actions/season";
import { getDonationsBySeason, type DonationWithContact } from "@/actions/donation";
import { getAllContacts, type Contact } from "@/actions/contact";
import { DonationTable } from "@/app/admin/season/[id]/donation/table";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SeasonDonationsPage({ params }: PageProps) {
  const [seasonId, setSeasonId] = useState<number | null>(null);
  const [seasonName, setSeasonName] = useState<string>("");
  const [donations, setDonations] = useState<DonationWithContact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const { id } = await params;
      const parsedId = Number(id);
      setSeasonId(parsedId);

      const [season, donationData, contactData] = await Promise.all([
        getSeasonById(parsedId),
        getDonationsBySeason(parsedId),
        getAllContacts(),
      ]);

      setSeasonName(season?.name ?? "");
      setDonations(donationData);
      setContacts(contactData);
    } catch (error) {
      console.error("Failed to load donations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || seasonId == null) {
    return <div className="text-center py-8">Chargement des dons...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HandHeart className="h-6 w-6 text-emerald-600" />
          Dons - Saison {seasonName || seasonId}
        </h1>
      </div>

      <p className="text-muted-foreground">
        Gérez les dons de cette saison : créer, modifier, supprimer et envoyer les reçus de don.
      </p>

      <DonationTable
        seasonId={seasonId}
        donations={donations}
        contacts={contacts}
        onRefresh={loadData}
        onContactCreated={(newContact) => setContacts((prev) => [newContact, ...prev])}
      />
    </div>
  );
}
