/** Simple sleep function */
export function sleep(delay: number) {
  return new Promise(r => setTimeout(r, delay));
}

/** Case-insensitive string compare */
export function fuzzyMatch(a?: string, b?: string) {
  return (a ?? '').toLowerCase() === (b ?? '').toLowerCase();
}