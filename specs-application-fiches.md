# Spécifications Techniques — Application de Fiches

## 1. Contexte et objectif

Application web permettant de créer, éditer et imprimer des fiches structurées. Chaque fiche contient plusieurs items, chacun avec son propre éditeur de texte riche. Les items sont agrégés dans un tableau à la fin. L'application est intégrée dans une application web plus large (Next.js).

---

## 2. Fonctionnalités principales

### Mode Édition

- Création et édition de fiches
- Chaque fiche contient plusieurs items
- Chaque item dispose de son propre éditeur de texte riche (gras, souligné, etc.)
- Ajout/suppression d'items dynamiquement
- Sauvegarde et rechargement des fiches

### Mode Aperçu PDF

- Panneau d'options de style indépendant de la rédaction :
  - Orientation portrait/paysage
  - Police du titre du document
  - Couleur du background et de certains éléments
  - Type de header du tableau
  - (autres options à définir)
- Prévisualisation en temps réel du tableau agrégé
- Les options de style s'appliquent via CSS variables injectées dynamiquement
- Export PDF via la boîte de dialogue d'impression du navigateur (Ctrl+P / bouton "Imprimer") — pas de génération PDF programmatique

**Pourquoi impression navigateur plutôt que génération PDF :**
- Le navigateur gère nativement l'export PDF ("Enregistrer en PDF" dans la boîte de dialogue)
- Moins de complexité technique
- Rendu fidèle via CSS `@media print`
- Limite acceptée : pas de contrôle sur le nom du fichier PDF généré

---

## 3. Décisions techniques

### Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| API | tRPC |
| Éditeur de texte riche | TipTap (une instance par item) |
| Styles | Tailwind CSS |
| Auth | NextAuth.js (si besoin) |

### Pourquoi tRPC plutôt que REST

- Types partagés automatiquement entre frontend et backend — erreur TypeScript immédiate si le modèle change
- Bien intégré dans l'écosystème Next.js/React
- Le switch vers REST reste possible si besoin : seule la couche transport est à réécrire, la logique métier (Prisma, validations) est réutilisable

**Important :** tRPC ne gère que les données, pas le routing. Les URLs restent entièrement gérées par le App Router de Next.js.

---

## 4. Modèle de données (Prisma — schéma indicatif)

```prisma
model Fiche {
  id         String   @id @default(cuid())
  titre      String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  userId     String
  items      Item[]
}

model Item {
  id        String   @id @default(cuid())
  ficheId   String
  fiche     Fiche    @relation(fields: [ficheId], references: [id])
  ordre     Int
  contenu   Json     // contenu TipTap sérialisé en JSON (JSONB PostgreSQL)
  createdAt DateTime @default(now())
}
```

> Le contenu des items est stocké en JSONB pour supporter une structure flexible — la structure exacte des items n'est pas encore définie.

---

## 5. Structure de dossiers Next.js (indicative)

```
app/
├── fiches/
│   ├── page.tsx                   → liste des fiches
│   └── [id]/
│       └── page.tsx               → édition d'une fiche
└── api/
    └── trpc/[trpc]/route.ts       → point d'entrée tRPC

components/
├── ItemEditor.tsx                 → éditeur TipTap par item
├── FicheEditor.tsx                → liste d'items d'une fiche
└── PdfPreview.tsx                 → aperçu + panneau options style

server/
└── routers/
    ├── fiche.ts                   → procédures tRPC fiches
    └── item.ts                    → procédures tRPC items

prisma/
└── schema.prisma
```

---

## 6. Points encore à définir

- Structure exacte des items (champs fixes ou libres ?)
- Colonnes du tableau agrégé
- Gestion des utilisateurs et authentification
- Périmètre complet de l'application web plus large dans laquelle ce module s'intègre
