import path from 'path';

/** Simple sleep function */
export function sleep(delay: number) {
  return new Promise(r => setTimeout(r, delay));
}

/** Case-insensitive string compare */
export function fuzzyMatch(a?: string, b?: string) {
  return (a ?? '').toLowerCase() === (b ?? '').toLowerCase();
}

/** Default config directory for this library */
export function configPath(filename: string) {
  return path.join(import.meta.dirname, `../config/${filename}`);
}

/** Resolve path relative to main script (entry point) */
export function getPath(relativePath: string) {
  const entryPoint = path.resolve(process.argv[1]);
  const entryDir = path.dirname(entryPoint);

  return path.join(entryDir, relativePath);
}