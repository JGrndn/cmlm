import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getAbsolutePath } from '@/lib/upload';
import path from 'path';
import fs from 'fs';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { path: parts } = await context.params;
  const relativePath = parts.join('/');

  if (relativePath.includes('..')) {
    return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 });
  }

  const absPath = getAbsolutePath(relativePath);
  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
  }

  const buffer = fs.readFileSync(absPath);
  const filename = path.basename(absPath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': String(buffer.length),
    },
  });
}
