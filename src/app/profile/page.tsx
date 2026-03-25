import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ListChecks } from "lucide-react";
import { getMyMemberships } from "@/actions/membership";
import { requireSession } from "@/lib/auth-server";
import { MembershipForm } from "./membership-form";
import { ProfileAlert } from "./profile-alert";

const typeLabel = {
  personal: "Personnel",
  family: "Familial",
} as const;

const statusLabel = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échec",
  cancelled: "Annulée",
} as const;

const statusClassname = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-(--sf-mist-gray) text-(--sf-red-800)",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-zinc-200 text-zinc-800",
} as const;

function splitDisplayName(name: string | null | undefined) {
  if (!name) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? "",
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, memberships, params] = await Promise.all([
    requireSession(),
    getMyMemberships(),
    searchParams,
  ]);
  const { firstName, lastName } = splitDisplayName(session.user.name);

  const membership = params.membership as string | undefined;
  const visibleMemberships = memberships.filter(
    (item) =>
      item.status === "paid" || item.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // Affiche les adhésions des dernières 24h même si le paiement a échoué.,
  );

  return (
    <main className="space-y-6">
      <h1 className="text-4xl font-bold text-(--sf-red-800)">Mon profil</h1>

      {membership && <ProfileAlert type={membership as "success" | "failed"} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="text-(--sf-red-700)" />
              <span>Nouvelle adhésion</span>
            </CardTitle>
            <CardDescription>
              Personnel: 42$ | Familial: 65$ - Paiement sécurisé via Clover
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MembershipForm
              initialFirstName={firstName}
              initialLastName={lastName}
              initialEmail={session.user.email ?? ""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ListChecks className="text-(--sf-red-700)" />
              <span>Mes adhésions</span>
            </CardTitle>
            <CardDescription>Historique et statut de vos adhésions</CardDescription>
          </CardHeader>
          <CardContent>
            {visibleMemberships.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucune adhésion pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {visibleMemberships.map((item) => (
                  <div key={item.id} className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {typeLabel[item.type]} - {item.price.toFixed(2)}$
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClassname[item.status]}`}
                      >
                        {statusLabel[item.status]}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-700">
                      {item.firstName} {item.lastName}
                    </p>

                    {item.type === "family" &&
                      item.secondAdultFirstName &&
                      item.secondAdultLastName && (
                        <p className="text-sm text-zinc-700">
                          2e adulte : {item.secondAdultFirstName} {item.secondAdultLastName}
                        </p>
                      )}

                    {item.children.length > 0 && (
                      <div className="mt-2 text-sm text-zinc-700">
                        <p className="font-medium">Enfants:</p>
                        <ul className="list-disc pl-5">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              {child.firstName} {child.lastName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.status === "paid" && item.paidAt && (
                      <>
                        {(() => {
                          const startDate = new Date(item.paidAt);
                          const endDate = new Date(startDate);
                          endDate.setFullYear(endDate.getFullYear() + 1);
                          const now = new Date();
                          const isActive = startDate <= now && now < endDate;

                          return (
                            <div className="mt-3 space-y-1 rounded-lg bg-zinc-50 p-2 text-sm">
                              <p>
                                <span className="font-medium">Début:</span>{" "}
                                {startDate.toLocaleDateString("fr-CA", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p>
                                <span className="font-medium">Fin:</span>{" "}
                                {endDate.toLocaleDateString("fr-CA", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="mt-2">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isActive
                                      ? "bg-(--sf-mist-gray) text-(--sf-red-800)"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {isActive ? "✓ Actif" : "Expirée"}
                                </span>
                              </p>

                              {isActive && (
                                <div className="mt-2">
                                  <Button asChild size="sm" className="w-full sm:w-auto">
                                    <a href={`/api/membership/${item.id}/card`}>
                                      Télécharger la carte de membre
                                    </a>
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}

                    {(item.status === "failed" || item.status === "pending") &&
                      item.cloverCheckoutUrl && (
                        <a
                          href={item.cloverCheckoutUrl}
                          className="mt-2 inline-block text-sm font-medium text-(--sf-red-700) underline"
                        >
                          Reprendre le paiement
                        </a>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
