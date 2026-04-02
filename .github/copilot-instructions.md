# Copilot Instructions

## Paiements

- Utiliser le modele `invoice` / `invoice_line` / `payment` comme source de verite pour toute gestion des paiements.
- Ne pas ajouter de logique de paiement directement dans les entites metier (`membership`, `donation`).
- Pour les nouveaux cas (ex: dons unitaires), passer par `invoice` + `invoice_line` puis relier le paiement via `payment`.
- Stocker les informations fournisseur de paiement (ex: Clover `checkoutSessionId`, URL checkout, transaction provider) dans `payment`, pas dans `invoice`.

## Migrations Drizzle

- Ne pas modifier manuellement les fichiers sous `migrations/`.
- Generer les migrations avec:

```bash
npx drizzle-kit generate
```
