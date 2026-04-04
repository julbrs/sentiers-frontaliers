"use client";

import { useEffect, useState } from "react";
import { HandHeart, Users, Gift, DollarSign } from "lucide-react";
import { getSeasonById } from "@/actions/season";
import { getDonationsBySeason, type DonationWithContact } from "@/actions/donation";
import { getAllContacts, type Contact } from "@/actions/contact";
import { DonationTable } from "@/app/admin/season/[id]/donation/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Calculate KPIs
  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const donationCount = donations.length;
  const uniqueDonors = new Set(donations.map((d) => d.donatorId)).size;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HandHeart className="h-6 w-6 text-(--sf-red-700)" />
          Dons - Saison {seasonName || seasonId}
        </h1>
      </div>

      <p className="text-muted-foreground">
        Gérez les dons de cette saison : créer, modifier, supprimer et envoyer les reçus de don.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              CAD
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Dons</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donationCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donateurs Distincts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDonors}</div>
          </CardContent>
        </Card>
      </div>

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
