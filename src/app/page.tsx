import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, DollarSign, Mountain, Users } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="container mx-auto px-4">
      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-(--sf-red-800) mb-8 text-center">
          Comment participer
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Membership Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="text-(--sf-secondary-700)" />
                <span>Adhésion</span>
              </CardTitle>
              <CardDescription>Devenez membre de l'organisation</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Accédez aux bénéfices exclusifs des membres et soutenez directement notre mission de
                préservation des sentiers.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white"
                asChild
              >
                <Link href="/profile">Mon profil</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Donation Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="text-(--sf-secondary-700)" />
                <span>Faire un don</span>
              </CardTitle>
              <CardDescription>Soutenez nos initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Contribuez financièrement à l'entretien et au développement de nos sentiers. Vos
                dons sont déductibles d'impôt.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-(--sf-secondary-300) text-white"
                variant="outline"
                disabled
              >
                Bientot disponible
              </Button>
            </CardFooter>
          </Card>

          {/* Community Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="text-(--sf-secondary-700)" />
                <span>Nos sentiers</span>
              </CardTitle>
              <CardDescription>Découvrez nos parcours</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Explorez notre réseau de sentiers bien entretenus, parfaits pour la randonnée
                pédestre en montagne.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-(--sf-secondary-300) text-white"
                variant="outline"
                disabled
              >
                Bientôt disponible
              </Button>
            </CardFooter>
          </Card>

          {/* About Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mountain className="text-(--sf-secondary-700)" />
                <span>À propos</span>
              </CardTitle>
              <CardDescription>En savoir plus</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Découvrez l'histoire de Sentiers Frontaliers, nos valeurs et notre engagement envers
                la communauté.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-(--sf-secondary-300) text-white"
                variant="outline"
                disabled
              >
                Bientôt disponible
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
