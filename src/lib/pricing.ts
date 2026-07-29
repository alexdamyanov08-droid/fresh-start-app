import type { PriceTiers } from "@/data/products";
import type { DesignElement } from "@/lib/cart-store";

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

/**
 * Precio de personalización según el tamaño en píxeles de UN elemento
 * (logo o texto). 0-20px: 1€ · 21-30: 1,50€ · 31-40: 2€ · 41-50: 2,50€ · 51-60: 3€
 */
export function priceForPixels(px: number): number {
  if (px <= 20) return 1;
  if (px <= 30) return 1.5;
  if (px <= 40) return 2;
  if (px <= 50) return 2.5;
  return 3;
}

/** Recargo total de personalización: suma del precio de cada logo/texto añadido. */
export function surchargeOf(elements: DesignElement[]): number {
  return elements.reduce((s, el) => s + priceForPixels(el.size), 0);
}
