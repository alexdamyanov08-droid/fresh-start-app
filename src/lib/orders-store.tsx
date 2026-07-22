import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./cart-store";

export type Order = {
  id: string;
  number: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "processing" | "shipped" | "delivered";
  userEmail: string | null;
};

const KEY = "merchango-orders-v1";

const Ctx = createContext<{
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
  clearOrders: () => void;
}>({ orders: [], addOrder: () => ({} as Order), clearOrders: () => {} });

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setOrders(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order = (o) => {
    const full: Order = {
      ...o,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: "processing",
    };
    setOrders((prev) => [full, ...prev]);
    return full;
  };
  const clearOrders = () => setOrders([]);

  return (
    <Ctx.Provider value={{ orders, addOrder, clearOrders }}>{children}</Ctx.Provider>
  );
}
export const useOrders = () => useContext(Ctx);
