import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  code: string;
  name: string;
  image: string | null;
  size: string;
  colorName: string;
  colorHex: string;
  qty: number;
  unitPrice: number;
  logoPlacement: string | null;
  customText: string | null;
  textFont: string | null;
  textColor: string | null;
};

const KEY = "neo-street-cart-v1";

const Ctx = createContext<{
  items: CartItem[];
  add: (i: Omit<CartItem, "id">) => void;
  update: (id: string, i: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ items: [], add: () => {}, update: () => {}, remove: () => {}, clear: () => {}, count: 0, total: 0, open: false, setOpen: () => {} });

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
  const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  return (
    <Ctx.Provider value={{ items, add, update, remove, clear, count, total, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}
export const useCart = () => useContext(Ctx);
