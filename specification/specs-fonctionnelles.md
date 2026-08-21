# Specs fonctionnelles — CMLM (Cahier de Mise en Ligne des Matières)

## Contexte

Application web pour professeurs des écoles (maternelle et élémentaire). Chaque professeur gère son propre espace de travail : **classeurs** organisés par année scolaire et niveau, contenant des matières, séquences, séances et fiches de cours.

Isolation stricte : chaque utilisateur ne voit que son propre contenu.

---

## 1. Acteurs

| Acteur | Description |
|---|---|
| **Professeur** | Utilisateur principal. Crée et gère ses classeurs, matières, séquences, séances et fiches. |
| **Admin** | Gère les utilisateurs. Peut consulter les données de référence (niveaux, domaines). |

---

## 2. Hiérarchie des contenus

```
Classeur  (rattaché à un niveau scolaire + une année scolaire)
└── Matière  (rattachée à un domaine/sous-domaine du programme scolaire)
    └── Séquence  (avec période : P1–P5)
        └── Séance  (avec date et durée calculée)
            └── Fiche  (0 à N par séance)
                └── Item  (blocs de contenu TipTap, avec durée unitaire)
```

---

## 3. Données de référence (seeded en BDD, non éditables par l'utilisateur)

### 3.1 Niveaux scolaires

| Code | Libellé | Cycle |
|---|---|---|
| PS | Petite Section | Cycle 1 |
| MS | Moyenne Section | Cycle 1 |
| GS | Grande Section | Cycle 1 |
| CP | Cours Préparatoire | Cycle 2 |
| CE1 | Cours Élémentaire 1 | Cycle 2 |
| CE2 | Cours Élémentaire 2 | Cycle 2 |
| CM1 | Cours Moyen 1 | Cycle 3 |
| CM2 | Cours Moyen 2 | Cycle 3 |

### 3.2 Années scolaires

Pré-remplies pour les années courantes et suivantes (ex: 2024-2025, 2025-2026, 2026-2027). L'admin peut en ajouter.

### 3.3 Domaines et sous-domaines du programme scolaire

Organisés par cycle (Cycle 1, 2, 3), conformes au Bulletin Officiel :

**Cycle 1 (PS, MS, GS) — exemples :**
- Mobiliser le langage dans toutes ses dimensions
  - L'oral
  - L'écrit
- Agir, s'exprimer, comprendre à travers l'activité physique
- Explorer le monde
  - Se repérer dans le temps et l'espace
  - Explorer le monde du vivant, des objets et de la matière

**Cycle 2 (CP, CE1, CE2) — exemples :**
- Français
  - Lecture et compréhension de l'écrit
  - Écriture
  - Étude de la langue
- Mathématiques
  - Nombres et calculs
  - Grandeurs et mesures
  - Espace et géométrie
- Enseignement moral et civique
- Histoire-géographie
- Sciences et technologie
- Arts plastiques
- Éducation musicale
- EPS

**Cycle 3 (CM1, CM2) — mêmes domaines + approfondissement.**

> La liste complète sera extraite du BO et insérée en seed. Les matières créées par le professeur sont liées à un sous-domaine de leur cycle.

---

## 4. Règles métier

### 4.1 Isolation utilisateur

- Toutes les entités créées par un utilisateur lui appartiennent exclusivement.
- L'isolation est garantie côté serveur : toutes les requêtes tRPC sont des `protectedProcedure` et filtrent par `userId` issu de la session.
- Un utilisateur ne peut jamais accéder, modifier ou supprimer les données d'un autre.

### 4.2 Classeur

- Un classeur est rattaché à **une année scolaire** et **un niveau scolaire**.
- On peut **dupliquer** un classeur pour une nouvelle année scolaire : cela crée une copie complète de toute l'arborescence (matières, séquences, séances, fiches, items), attachée à l'année cible. Les données originales restent intactes.
- Un classeur peut être rattaché à une année différente sans duplication (simple réaffectation).

### 4.3 Matière

- Une matière appartient à un classeur.
- Elle est liée à un **sous-domaine** du programme scolaire (optionnel mais recommandé). Le sous-domaine est filtré par le cycle du niveau du classeur.
- L'ordre des matières dans un classeur est modifiable.

### 4.4 Séquence

- Une séquence appartient à une matière.
- Elle est associée à une **période** (P1 à P5) indiquant quand dans l'année elle est travaillée.
- L'ordre des séquences dans une matière est modifiable.
- Champs : titre, période, objectifs généraux (optionnel).

### 4.5 Séance

- Une séance appartient à une séquence.
- Champs : titre, date (optionnelle), ordre dans la séquence.
- La **durée totale** d'une séance est calculée dynamiquement : somme des durées de tous les items de toutes ses fiches.
- Une séance peut avoir 0 à N fiches.

### 4.6 Fiche

- Une fiche appartient à une séance.
- Elle contient 0 à N items (blocs de contenu).
- Elle est visualisable sous forme de **document imprimable** (fiche de séance) avec options de style (orientation, couleurs, police) — via CSS `@media print`.
- Champs : titre, ordre dans la séance.

### 4.7 Item

- Un item appartient à une fiche.
- Contenu : texte riche sérialisé en JSON (TipTap).
- Champs : contenu (TipTap JSON), ordre, durée en minutes (optionnelle).
- La durée d'un item contribue au calcul de la durée de la séance parente.

---

## 5. Modèle de données proposé (Prisma)

```prisma
// ─── Données de référence ───────────────────────────────────────────────────

model Cycle {
  id       String           @id @default(cuid())
  code     String           @unique  // "cycle1" | "cycle2" | "cycle3"
  label    String
  niveaux  NiveauScolaire[]
  domaines Domaine[]
  @@map("cycles")
}

model NiveauScolaire {
  id        String     @id @default(cuid())
  code      String     @unique  // PS | MS | GS | CP | CE1 | CE2 | CM1 | CM2
  label     String
  ordre     Int
  cycleId   String
  cycle     Cycle      @relation(fields: [cycleId], references: [id])
  classeurs Classeur[]
  @@map("niveaux_scolaires")
}

model AnneeScolaire {
  id        String     @id @default(cuid())
  label     String     @unique  // "2025-2026"
  debut     Int                 // 2025
  fin       Int                 // 2026
  classeurs Classeur[]
  @@map("annees_scolaires")
}

model Domaine {
  id           String        @id @default(cuid())
  label        String
  cycleId      String
  cycle        Cycle         @relation(fields: [cycleId], references: [id])
  sousDomaines SousDomaine[]
  @@map("domaines")
}

model SousDomaine {
  id        String    @id @default(cuid())
  label     String
  domaineId String
  domaine   Domaine   @relation(fields: [domaineId], references: [id])
  matieres  Matiere[]
  @@map("sous_domaines")
}

// ─── Contenu utilisateur ────────────────────────────────────────────────────

model Classeur {
  id               String         @id @default(cuid())
  titre            String
  userId           String
  user             User           @relation(fields: [userId], references: [id])
  niveauId         String
  niveau           NiveauScolaire @relation(fields: [niveauId], references: [id])
  anneeScolaireId  String
  anneeScolaire    AnneeScolaire  @relation(fields: [anneeScolaireId], references: [id])
  matieres         Matiere[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  @@map("classeurs")
}

model Matiere {
  id            String       @id @default(cuid())
  titre         String
  classeurId    String
  classeur      Classeur     @relation(fields: [classeurId], references: [id], onDelete: Cascade)
  sousDomaine   SousDomaine? @relation(fields: [sousDomainId], references: [id])
  sousDomainId  String?
  ordre         Int
  sequences     Sequence[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  @@map("matieres")
}

enum Periode {
  P1
  P2
  P3
  P4
  P5
}

model Sequence {
  id         String    @id @default(cuid())
  titre      String
  matiereId  String
  matiere    Matiere   @relation(fields: [matiereId], references: [id], onDelete: Cascade)
  periode    Periode?
  objectifs  String?
  ordre      Int
  seances    Seance[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  @@map("sequences")
}

model Seance {
  id         String    @id @default(cuid())
  titre      String
  sequenceId String
  sequence   Sequence  @relation(fields: [sequenceId], references: [id], onDelete: Cascade)
  date       DateTime?
  ordre      Int
  fiches     Fiche[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  // duree = SUM(items.duree) via fiches — calculée à la lecture, non stockée
  @@map("seances")
}

model Fiche {
  id        String   @id @default(cuid())
  titre     String
  seanceId  String
  seance    Seance   @relation(fields: [seanceId], references: [id], onDelete: Cascade)
  ordre     Int
  items     Item[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("fiches")
}

model Item {
  id        String   @id @default(cuid())
  ficheId   String
  fiche     Fiche    @relation(fields: [ficheId], references: [id], onDelete: Cascade)
  ordre     Int
  duree     Int?     // minutes
  contenu   Json     // TipTap JSON (JSONB PostgreSQL)
  createdAt DateTime @default(now())
  @@map("items")
}
```

> Le modèle `User` existant est conservé tel quel. On ajoute la relation inverse `classeurs Classeur[]`.

---

## 6. Routes applicatives

```
/                          → Dashboard (liste des classeurs de l'utilisateur)
/classeurs/new             → Créer un classeur
/classeurs/[id]            → Détail classeur (liste des matières)
/classeurs/[id]/matieres/[matiereId]                                                              → Détail matière (liste des séquences)
/classeurs/[id]/matieres/[matiereId]/sequences/[sequenceId]                                       → Détail séquence (liste des séances)
/classeurs/[id]/matieres/[matiereId]/sequences/[sequenceId]/seances/[seanceId]                    → Éditeur de séance
/classeurs/[id]/matieres/[matiereId]/sequences/[sequenceId]/seances/[seanceId]/fiches/[ficheId]/print  → Aperçu impression
```

> Navigation par breadcrumb pour garder le contexte à travers la hiérarchie.

---

## 7. Menu latéral (navigation principale)

| Item | Icône | Route |
|---|---|---|
| Tableau de bord | LayoutDashboard | `/` |
| Mes classeurs | BookOpen | `/classeurs` |
| — (admin only) | | |
| Utilisateurs | Settings | `/admin/users` |

La navigation dans la hiérarchie (matière → séquence → séance) se fait en parcourant les pages, pas via le menu latéral.

---

## 8. Fonctionnalités détaillées

### 8.1 Dashboard

- Liste des classeurs de l'utilisateur connecté
- Groupés par année scolaire (la courante en premier)
- Indicateurs : nombre de matières, de séquences, de séances par classeur
- Actions : créer, dupliquer, supprimer un classeur

### 8.2 Duplication de classeur

- Sélectionner l'année scolaire cible
- Crée une copie complète de toute l'arborescence pour le même utilisateur
- Les données source restent intactes

### 8.3 Éditeur de séance

- Liste des fiches de la séance (ordonnées, réordonnables)
- Durée totale calculée dynamiquement : somme des `item.duree`
- Bouton "Voir la fiche" → page d'impression

### 8.4 Vue impression d'une fiche

- Panneau d'options de style : orientation (portrait/paysage), couleur principale, police du titre
- Options appliquées via CSS variables
- Bouton "Imprimer" → `window.print()`
- Classes `@media print` masquent le panneau d'options

---

## 9. Sécurité et isolation

Toutes les procédures tRPC sont des `protectedProcedure` :

```ts
// Vérification d'appartenance — pattern à appliquer sur toutes les mutations
const classeur = await ctx.prisma.classeur.findFirst({
  where: { id: input.classeurId, userId: ctx.session.user.id }
});
if (!classeur) throw new TRPCError({ code: 'NOT_FOUND' });
```

Pour les entités enfants (matière, séquence, séance, fiche, item), la vérification remonte jusqu'au `classeur.userId`.

---

## 10. Points restant à préciser

| Question | Impact |
|---|---|
| Structure exacte du contenu TipTap d'un item (champs fixes ou libres ?) | Modèle Item |
| Liste complète des domaines/sous-domaines par cycle (BO) | Seed BDD |
| Faut-il une notion de "modèle de classeur" partageable entre collègues ? | Scope futur |
| Gestion des images dans les fiches (upload ?) | Scope futur |

---

## 11. Migrations à prévoir (depuis l'état actuel)

1. **Supprimer** les modèles `Fiche` et `Item` actuels (bare string `userId`, sans relation)
2. **Ajouter** les données de référence : `Cycle`, `NiveauScolaire`, `AnneeScolaire`, `Domaine`, `SousDomaine`
3. **Ajouter** la hiérarchie utilisateur : `Classeur`, `Matiere`, `Sequence`, `Seance`, `Fiche`, `Item`
4. **Mettre à jour** `User` avec la relation `classeurs`
5. **Seeder** les données de référence (niveaux, années, domaines/sous-domaines)
6. **Migrer** les tRPC routers vers `protectedProcedure` + filtres `userId`
7. **Mettre à jour** le menu latéral : remplacer "Fiches" par "Mes classeurs"
