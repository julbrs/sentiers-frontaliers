import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Mountain, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="container mx-auto mt-8 px-4">
      <h2 className="text-3xl font-bold text-emerald-800 mb-6">Tableau de bord</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="text-emerald-600" />
              <span>Gestion des donations</span>
            </CardTitle>
            <CardDescription>Gérez les donations et les reçus fiscaux</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Suivez et gérez les donations reçues pour le réseau de sentiers frontaliers.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
              <Link href={"/admin"}>Accéder</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Placeholder for future modules */}
        <Card className="border-dashed border-2 border-emerald-300">
          <CardHeader>
            <CardTitle className="text-emerald-600 flex items-center gap-2">
              <Mountain size={20} />À venir
            </CardTitle>
            <CardDescription>Plus de fonctionnalités en développement</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Des fonctionnalités supplémentaires de gestion des sentiers seront ajoutées ici.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
