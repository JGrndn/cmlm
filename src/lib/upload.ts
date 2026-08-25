import path from 'path';
import fs from 'fs';

export function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR ?? './uploads';
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

export function getAbsolutePath(relativePath: string): string {
  return path.join(getUploadDir(), relativePath);
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}
