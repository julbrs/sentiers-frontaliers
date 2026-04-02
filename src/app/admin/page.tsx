import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ReceiptText, Users, UserCog } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="space-y-6">
      <h1 className="text-4xl font-bold text-(--sf-red-800)">Tableau de bord administrateur</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Donations Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="text-(--sf-red-700)" />
              <span>Gestion des donations</span>
            </CardTitle>
            <CardDescription>Gérer les années fiscales et donations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez des années fiscales, consultez et gérez les donations reçues.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white" asChild>
              <Link href="/admin/donation">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contacts Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="text-(--sf-red-700)" />
              <span>Gestion des contacts</span>
            </CardTitle>
            <CardDescription>Gérer les contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez, modifiez ou supprimez les contacts.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white" asChild>
              <Link href="/admin/contact">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Users Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCog className="text-(--sf-red-700)" />
              <span>Gestion des utilisateurs</span>
            </CardTitle>
            <CardDescription>Gérer les comptes utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ajoutez, modifiez ou supprimez les utilisateurs et leurs rôles.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white" asChild>
              <Link href="/admin/user">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ReceiptText className="text-(--sf-red-700)" />
              <span>Résumé des ventes Clover</span>
            </CardTitle>
            <CardDescription>Exporter un rapport PDF pour la comptabilité</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Générez un tableau de conciliation bancaire entre deux dates avec frais optionnels.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800) text-white" asChild>
              <Link href="/admin/sales-summary">Accéder</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
