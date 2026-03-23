"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mountain, MailCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type RequestState = "idle" | "sending" | "sent";

const errorMessages: Record<string, string> = {
  INVALID_TOKEN: "Le lien est invalide ou déjà utilisé.",
  EXPIRED_TOKEN: "Le lien a expiré. Demandez-en un nouveau.",
  new_user_signup_disabled: "Les nouvelles inscriptions sont désactivées.",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [state, setState] = useState<RequestState>("idle");
  const searchParams = useSearchParams();

  const callbackURL = useMemo(() => "/", []);

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (!errorCode) return;

    toast.error("Impossible de vérifier le lien", {
      description: errorMessages[errorCode] || "Une erreur est survenue. Merci de réessayer.",
    });
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSentTo(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Adresse e-mail requise", {
        description: "Indique une adresse pour recevoir ton lien de connexion.",
      });
      return;
    }

    setState("sending");

    try {
      const { error } = await authClient.signIn.magicLink({
        email: trimmed,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: "/login",
      });

      if (error) {
        const message = (error as { message?: string }).message || "Impossible d'envoyer le lien.";
        throw new Error(message);
      }

      setSentTo(trimmed);
      setState("sent");
      toast("Lien envoyé", {
        description: "Consulte ta boîte mail. Le lien est valable 5 minutes.",
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Une erreur est survenue.";
      setState("idle");
      toast.error("Envoi impossible", {
        description,
      });
      return;
    }

    setEmail("");
  }

  const isSending = state === "sending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-emerald-100">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto bg-emerald-600 text-white p-3 rounded-full inline-flex items-center justify-center shadow-md">
              <Mountain size={32} />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800">
              Sentiers Frontaliers
            </CardTitle>
            <p className="text-emerald-700 text-sm">
              Connecte-toi en recevant un lien magique par e-mail.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="prenom.nom@exemple.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isSending}
                />
                <p className="text-xs text-emerald-700">
                  Nous enverrons un lien valable 5 minutes.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isSending}
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MailCheck className="h-4 w-4" />
                    Envoyer le lien magique
                  </span>
                )}
              </Button>
            </form>

            {sentTo && state === "sent" && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                Lien envoyé à <span className="font-semibold">{sentTo}</span>. Pense à vérifier tes
                courriers indésirables.
              </div>
            )}

            <div className="text-xs text-emerald-800 space-y-1">
              <p>Pas de mot de passe à retenir, juste ton e-mail.</p>
              <p>Le lien expirera automatiquement pour ta sécurité.</p>
            </div>
          </CardContent>

          <CardFooter className="justify-center text-sm text-emerald-700">
            Besoin d'aide ? Contacte la trésorerie si tu ne reçois pas le lien.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
          Chargement...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
