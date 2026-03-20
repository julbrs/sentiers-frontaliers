import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Heart } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="space-y-6">
      <h1 className="text-4xl font-bold text-emerald-800">Mon profil</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Membership Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="text-emerald-600" />
              <span>Adhésion</span>
            </CardTitle>
            <CardDescription>Gestion de votre adhésion</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Consultez et gérez les détails de votre adhésion à l'organisation.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Bientôt disponible</p>
          </CardFooter>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="text-emerald-600" />
              <span>Informations personnelles</span>
            </CardTitle>
            <CardDescription>Vos données de profil</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Consultez et modifiez vos informations personnelles.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Bientôt disponible</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
