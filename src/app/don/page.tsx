import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-server";
import { DonationCheckoutForm } from "./donation-checkout-form";

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

export default async function DonationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([requireSession(), searchParams]);
  const { firstName, lastName } = splitDisplayName(session.user.name);
  const donationStatus = params.donation as string | undefined;

  return (
    <main className="space-y-6">
      <h1 className="text-4xl font-bold text-(--sf-red-800)">Faire un don</h1>

      {donationStatus === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          Paiement complété. Merci pour votre contribution.
        </div>
      )}

      {donationStatus === "failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          Le paiement a été refusé. Vous pouvez réessayer.
        </div>
      )}

      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <CardTitle>Formulaire de don</CardTitle>
          <CardDescription>
            Entrez vos informations puis effectuez le paiement sécurisé via Clover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonationCheckoutForm
            initialFirstName={firstName}
            initialLastName={lastName}
            initialAddress=""
          />
        </CardContent>
      </Card>
    </main>
  );
}
