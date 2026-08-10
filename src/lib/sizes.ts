// Orden lógico de tallas para mostrarlas en la web (en vez del orden aleatorio del Excel).
const LETTER_ORDER = [
  "3XS", "2XS", "XXS", "XS", "S", "M", "L", "XL",
  "XXL", "2XL", "3XL", "XXXL", "4XL", "5XL", "6XL",
];

function letterIndex(token: string): number {
  const i = LETTER_ORDER.indexOf(token);
  return i === -1 ? 999 : i;
}

function sizeSortKey(raw: string): [number, number, string] {
  const s = raw.trim().toUpperCase();

  if (LETTER_ORDER.includes(s)) return [0, letterIndex(s), s];

  // meses / años (tallas de bebé), p.ej. "6 MESES", "2 AÑOS"
  let m = s.match(/^(\d+)\s*MESES?$/);
  if (m) return [1, parseInt(m[1], 10), s];
  m = s.match(/^(\d+)\s*A[ÑN]OS?$/);
  if (m) return [1, parseInt(m[1], 10) * 12, s];

  // rangos tipo "3/4", "9/10" (tallas infantiles)
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return [2, parseInt(m[1], 10), s];

  // tallas numéricas puras (edades, pantalón, vaquero...)
  m = s.match(/^(\d+)$/);
  if (m) return [3, parseInt(m[1], 10), s];

  // rangos combinados tipo "XS-S", "M-L", "XL-2XL"
  m = s.match(/^([A-Z0-9]+)-([A-Z0-9]+)$/);
  if (m) return [0, letterIndex(m[1]), s];

  // tallas de calzado/agrupadas "KID (31/34)", "JR (35/40)", "SR (41-46)"
  const group: Record<string, number> = { KID: 0, JR: 1, SR: 2 };
  const gKey = Object.keys(group).find((k) => s.startsWith(k));
  if (gKey) return [4, group[gKey], s];

  return [5, 0, s];
}

/** Indica si una talla es de nino/bebe (meses, anos, rangos infantiles tipo
 *  "5/6", o numeros bajos de edad), a diferencia de las de adulto (S-5XL, 36-52...). */
export function isKidSize(raw: string): boolean {
  const s = raw.trim().toUpperCase();
  if (/^\d+\s*MESES?$/.test(s)) return true;
  if (/^\d+\s*A[ÑN]OS?$/.test(s)) return true;
  if (/^(\d+)\/(\d+)$/.test(s)) return true;
  const m = s.match(/^(\d+)$/);
  if (m) return parseInt(m[1], 10) < 18;
  if (s.startsWith("KID") || s.startsWith("JR")) return true;
  return false;
}
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ka = sizeSortKey(a);
    const kb = sizeSortKey(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] - kb[1];
    return ka[2].localeCompare(kb[2]);
  });
}
