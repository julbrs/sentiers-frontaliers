import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, UserCog } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="space-y-6">
      <h1 className="text-4xl font-bold text-emerald-800">Tableau de bord administrateur</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Donations Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="text-emerald-600" />
              <span>Gestion des donations</span>
            </CardTitle>
            <CardDescription>Gérer les années fiscales et donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez des années fiscales, consultez et gérez les donations reçues.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
              <Link href="/admin/donation">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contacts Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="text-emerald-600" />
              <span>Gestion des contacts</span>
            </CardTitle>
            <CardDescription>Gérer les contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez, modifiez ou supprimez les contacts.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
              <Link href="/admin/contact">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Users Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCog className="text-emerald-600" />
              <span>Gestion des utilisateurs</span>
            </CardTitle>
            <CardDescription>Gérer les comptes utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez, modifiez ou supprimez les utilisateurs et leurs rôles.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
              <Link href="/admin/user">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
