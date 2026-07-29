import type { PriceTiers } from "@/data/products";

/**
 * Devuelve el tramo de precio (1-10 / 11-30 / 31-100 / 101+) según la cantidad
 * TOTAL de unidades de la misma referencia (todas las tallas y colores juntos).
 */
export function tierKeyForQty(totalQty: number): keyof PriceTiers {
  if (totalQty <= 10) return "t1_10";
  if (totalQty <= 30) return "t11_30";
  if (totalQty <= 100) return "t31_100";
  return "t101_plus";
}

/**
 * Precio unitario (sin personalización) de UNA variante exacta (talla+color),
 * dado el total de unidades de esa misma referencia que hay en el carrito.
 */
export function basePriceForVariant(tiers: PriceTiers, totalQtyForReference: number): number {
  const key = tierKeyForQty(totalQtyForReference);
  return tiers[key];
}
