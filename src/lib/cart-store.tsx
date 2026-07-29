import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PriceTiers } from "@/data/products";
import { basePriceForVariant, surchargeOf } from "@/lib/pricing";

/** Un logo o texto colocado sobre la prenda. Puede haber varios a la vez. */
export type DesignElement = {
  id: string;
  kind: "image" | "text";
  image?: string | null;
  text?: string | null;
  font?: string | null;
  color?: string | null;
  size: number; // en px, decide el precio de personalización de ESTE elemento
  pos: { x: number; y: number };
};

export type CartItem = {
  id: string;
  code: string; // referencia/modelo, ej. "BD7200"
  name: string;
  image: string | null;
  size: string;
  colorName: string;
  colorHex: string;
  qty: number;
  tiers: PriceTiers; // los 4 precios REDondeados de ESTA talla+color exacta
  elements: DesignElement[]; // todos los logos/textos añadidos a esta prenda
};

const KEY = "neo-street-cart-v1";

/** Unidades totales de la misma referencia (todas tallas/colores) que hay en el carrito. */
function totalQtyForCode(items: CartItem[], code: string) {
  return items.reduce((s, i) => (i.code === code ? s + i.qty : s), 0);
}

/** Precio unitario final de una línea del carrito (precio por tramo + personalización). */
export function unitPriceOf(items: CartItem[], item: CartItem): number {
  const totalForRef = totalQtyForCode(items, item.code);
  return basePriceForVariant(item.tiers, totalForRef) + surchargeOf(item.elements);
}

const Ctx = createContext<{
  items: CartItem[];
  add: (i: Omit<CartItem, "id">) => void;
  update: (id: string, i: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
  unitPrice: (item: CartItem) => number;
  open: boolean;
  setOpen: (v: boolean) => void;
}>({
  items: [], add: () => {}, update: () => {}, remove: () => {}, clear: () => {},
  count: 0, total: 0, unitPrice: () => 0, open: false, setOpen: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = (i: Omit<CartItem, "id">) =>
    setItems((prev) => [...prev, { ...i, id: crypto.randomUUID() }]);
  const update = (id: string, i: Omit<CartItem, "id">) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...i, id } : x)));
  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * unitPriceOf(items, i), 0);
  const unitPrice = (item: CartItem) => unitPriceOf(items, item);

  return (
    <Ctx.Provider value={{ items, add, update, remove, clear, count, total, unitPrice, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}
export const useCart = () => useContext(Ctx);
