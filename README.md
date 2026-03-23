# Sentiers Frontaliers

## Comme développer?

C'est un projet NextJs:

```
pnpm install
pnpm dev
```

## Base de données

```
npx drizzle-kit generate
```

```
npx drizzle-kit migrate
```

## Clover - Hosted Checkout (sandbox)

Cette app utilise Clover Hosted Checkout pour le paiement des adhesions.

### 1) Cote Clover Dev Dashboard (developpeur)

1. Verifier que l'application Clover existe et est active en sandbox.
2. Verifier les permissions/scopes nécessaires au Hosted Checkout (invoicing/checkout).
3. Générer un token valide apres toute modification de scopes.
4. Utiliser les memes informations dans `.env`:
   - `CLOVER_API_BASE_URL=https://apisandbox.dev.clover.com`
   - `CLOVER_MERCHANT_ID=<merchant_sandbox>`
   - `CLOVER_PRIVATE_TOKEN=<token_du_meme_merchant>`

### 2) Cote Portail Marchand (merchant test)

1. Ouvrir le merchant test exact utilise par l'application.
2. Installer (ou réinstaller) l'app Clover sur ce merchant.
3. Accepter les autorisations demandées par l'app.
4. Verifier que l'app est bien active sur ce merchant.

Si l'app est supprimée du merchant test, le checkout peut s'ouvrir mais échouer au paiement.

### 3) Webhook

1. Configurer l'URL webhook publique (ngrok/localtunnel) vers:
   - `/api/clover/webhook`
2. Mettre a jour `CLOVER_WEBHOOK_SECRET` avec la valeur Clover.
3. Redémarrer le serveur apres changement de `.env`.

### 4) Validation rapide

1. Creation session checkout: OK (retour `href` + `checkoutSessionId`).
2. Paiement sur page Clover: OK.
3. Webhook `PAYMENT APPROVED` reçu: OK.
4. Adhesion marquee `paid` en base: OK.

### 5) Erreur courante

Message: `Payment source is missing.`

Points a verifier en priorité:

1. L'app Clover est bien installée sur le merchant test.
2. Le token et le merchant correspondent au meme compte sandbox.
3. Test en navigation privée (sans extensions) et avec une carte de test Clover (pas une carte Stripe `4242...`).
