"use client";

import { useState, useEffect } from "react";
import { getData } from "@/actions/season";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import AddSeasonDialog from "../add-season-dialog";

function formatDate(date: Date | string) {
  let dateObj: Date;
  if (typeof date === "string") {
    const [year, month, day] = date.split("-").map(Number);
    dateObj = new Date(year, month - 1, day);
  } else {
    dateObj = date;
  }
  return format(dateObj, "yyyy-MM-dd");
}

interface Season {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
}

export default function DonationManagement() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const seasonsData = await getData();
        setSeasons(
          seasonsData.map((s) => {
            const parseLocalDate = (dateString: string) => {
              const [year, month, day] = dateString.split("-").map(Number);
              return new Date(year, month - 1, day);
            };
            return {
              ...s,
              startDate: parseLocalDate(s.startDate as unknown as string),
              endDate: parseLocalDate(s.endDate as unknown as string),
            };
          }),
        );
      } catch (error) {
        console.error("Error loading seasons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-emerald-800 mb-6">Gestion des donations</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Add Season Card */}
        <Card className="border-dashed border-2 border-emerald-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="text-emerald-600" />
              <span>Ajouter une année fiscale</span>
            </CardTitle>
            <CardDescription>Créer une nouvelle année fiscale</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez une nouvelle année fiscale pour gérer les donations.</p>
          </CardContent>
          <CardFooter>
            <AddSeasonDialog />
          </CardFooter>
        </Card>

        {/* Seasons Cards */}
        {seasons.map((season) => (
          <Card key={season.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="text-emerald-600" />
                <span>{season.name}</span>
              </CardTitle>
              <CardDescription>
                Du {formatDate(season.startDate)} au {formatDate(season.endDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Gérez les donations et les détails de cette année fiscale.</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                <Link
                  href={`/admin/season/${season.id}/donation`}
                  className="flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Donations
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
