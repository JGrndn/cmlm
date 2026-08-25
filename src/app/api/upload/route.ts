import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { getUploadDir, ensureDir } from '@/lib/upload';
import path from 'path';
import fs from 'fs';

const MAX_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const ficheId = formData.get('ficheId') as string | null;

  if (!file || !ficheId) {
    return NextResponse.json({ error: 'Fichier et ficheId requis' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 20 Mo)' }, { status: 400 });
  }

  const fiche = await prisma.fiche.findUnique({
    where: { id: ficheId },
    include: {
      sequence: { include: { matiere: { include: { classeur: true } } } },
      classeur: true,
    },
  });
  if (!fiche) return NextResponse.json({ error: 'Fiche non trouvée' }, { status: 404 });
  const owned =
    fiche.sequence?.matiere.classeur.userId === session.user.id ||
    fiche.classeur?.userId === session.user.id;
  if (!owned) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uid = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  const filename = `${uid}-${safeName}`;
  const relativePath = `fiches/${ficheId}/${filename}`;
  const absDir = path.join(getUploadDir(), `fiches/${ficheId}`);
  ensureDir(absDir);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(absDir, filename), buffer);

  const record = await prisma.fichierAttache.create({
    data: { nom: file.name, chemin: relativePath, taille: file.size, ficheId },
  });

  return NextResponse.json({
    id: record.id,
    nom: record.nom,
    taille: record.taille,
    ficheId: record.ficheId,
    createdAt: record.createdAt,
    url: `/api/files/${relativePath}`,
  });
}
