"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck, Loader2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type RequestState = "idle" | "sending" | "sent";

const DEFAULT_CALLBACK_URL = "/";

const errorMessages: Record<string, string> = {
  INVALID_TOKEN: "Le lien est invalide ou déjà utilisé.",
  EXPIRED_TOKEN: "Le lien a expiré. Demandez-en un nouveau.",
  new_user_signup_disabled: "Les nouvelles inscriptions sont désactivées.",
};

function getSafeCallbackURL(redirect: string | null) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return DEFAULT_CALLBACK_URL;
  }

  return redirect;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [state, setState] = useState<RequestState>("idle");
  const searchParams = useSearchParams();

  const callbackURL = useMemo(
    () => getSafeCallbackURL(searchParams.get("redirect")),
    [searchParams],
  );
  const errorCallbackURL = useMemo(() => {
    const params = new URLSearchParams();
    if (callbackURL !== DEFAULT_CALLBACK_URL) {
      params.set("redirect", callbackURL);
    }

    const queryString = params.toString();
    return queryString ? `/login?${queryString}` : "/login";
  }, [callbackURL]);

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
        description: "Indiquez une adresse pour recevoir votre lien de connexion.",
      });
      return;
    }

    setState("sending");

    try {
      const { error } = await authClient.signIn.magicLink({
        email: trimmed,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });

      if (error) {
        const message = (error as { message?: string }).message || "Impossible d'envoyer le lien.";
        throw new Error(message);
      }

      setSentTo(trimmed);
      setState("sent");
      toast("Lien envoyé", {
        description: "Consultez votre boîte mail. Le lien est valable 5 minutes.",
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-(--sf-off-white) via-white to-(--sf-mist-gray) px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-(--sf-mist-gray)">
          <CardHeader className="text-center space-y-3">
            <Image
              src="/chevron.png"
              className="mx-auto"
              alt="Sentiers Frontaliers"
              height={48}
              width={48}
            />

            <CardTitle className="text-2xl font-bold text-(--sf-red-800)">
              Sentiers Frontaliers
            </CardTitle>
            <p className="text-(--sf-secondary-700) text-sm">
              Connectez-vous en recevant un lien magique par e-mail.
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
                <p className="text-xs text-(--sf-secondary-700)">
                  Nous enverrons un lien valable 5 minutes. Le lien expirera automatiquement pour
                  votre sécurité.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-(--sf-red-700) hover:bg-(--sf-red-800)"
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
              <div className="rounded-md border border-(--sf-secondary-100) bg-(--sf-secondary-50) px-3 py-2 text-sm text-(--sf-secondary-800)">
                Lien envoyé à <span className="font-semibold">{sentTo}</span>. Pensez à vérifier vos
                courriers indésirables.
              </div>
            )}

            <div className="text-xs text-(--sf-secondary-800) space-y-1">
              <p>
                Pas de mot de passe à retenir, juste votre e-mail. Un compte sera créé
                automatiquement si vous n'en avez pas.
              </p>
            </div>
          </CardContent>

          <CardFooter className="justify-center text-sm text-(--sf-secondary-700)">
            Besoin d'aide ?{"\u00A0"}
            <a
              href="mailto:info@sentiersfrontaliers.com"
              className="underline hover:text-(--sf-secondary-900) transition-colors"
            >
              Contactez-nous
            </a>
            {"\u00A0"}
            si vous ne recevez pas le lien.
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
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-(--sf-off-white) via-white to-(--sf-mist-gray)">
          Chargement...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
