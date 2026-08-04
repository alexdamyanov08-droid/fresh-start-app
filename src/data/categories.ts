// Grouped shop categories. Several raw product "family" values are merged
// into a single customer-facing category here, so small families don't get
// their own near-empty menu entry.
export const CATEGORY_GROUPS: { key: string; label: string; families: string[] }[] = [
  { key: "camisetas", label: "Camisetas", families: ["Camisetas", "Bodies"] },
  { key: "polos", label: "Polos", families: ["Polos"] },
  { key: "pantalones", label: "Pantalones", families: ["Pantalones"] },
  { key: "sudaderas", label: "Sudaderas", families: ["Sudaderas"] },
  { key: "pantalones-cortos", label: "Pantalones Cortos", families: ["Bermudas", "Pantalones Cortos"] },
  { key: "leggings", label: "Leggings", families: ["Leggings"] },
  {
    key: "cazadoras-parkas",
    label: "Cazadoras y Parkas",
    families: ["Chaquetas", "Ropa Abrigo", "Parkas", "Softshells", "Chubasqueros", "Cortavientos"],
  },
  {
    key: "ropa-deportiva",
    label: "Ropa Deportiva",
    families: ["Conjuntos Deportivos", "Ropa Deportiva", "Petos Deportivos", "Paddle", "Faldas"],
  },
  { key: "chalecos", label: "Chalecos", families: ["Chalecos"] },
  { key: "otros", label: "Otros", families: ["Calcetas Y Calcetines", "Bañadores"] },
];

// Individual products that should live in a different category than their
// raw "family" value would normally place them in.
export const CATEGORY_OVERRIDES: Record<string, string> = {
  PA0307: "ropa-deportiva", // "Serena" — falda-pantalón de pádel, no un pantalón normal
  PA0453: "pantalones-cortos", // "Player" — pantalón corto deportivo
  PA0484: "pantalones-cortos", // "Calcio" — pantalón corto deportivo
  PA0551: "pantalones-cortos", // "Arsenal" — pantalón corto de portero
};

export function familiesForCategory(key: string): string[] | null {
  const group = CATEGORY_GROUPS.find((g) => g.key === key);
  return group ? group.families : null;
}

export function categoryKeyForProduct(p: { code: string; family: string }): string | null {
  if (CATEGORY_OVERRIDES[p.code]) return CATEGORY_OVERRIDES[p.code];
  const group = CATEGORY_GROUPS.find((g) => g.families.includes(p.family));
  return group ? group.key : null;
}