import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Package, TrendingUp, Clock, Truck, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/cart-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel interno — Xprint Wear" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// Fila real de la tabla "orders" en Supabase.
type AdminOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  stripe_payment_status: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, unknown> | null;
  invoice_data: { companyName?: string; taxId?: string; address?: string } | null;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  created_at: string;
  paid_at: string | null;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado · por preparar",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_CLS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  paid: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  shipped: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-300",
};

function csvCell(v: unknown) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, checking } = useIsAdmin();

  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await (supabase as any)
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setLoadingOrders(false);
    if (error) {
      toast.error("No se pudieron cargar los pedidos");
      console.error(error);
      return;
    }
    setOrders((data ?? []) as AdminOrder[]);
  };

  useEffect(() => {
    if (isAdmin) loadOrders();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (q) {
        const hay =
          o.order_number.toLowerCase().includes(q) ||
          (o.customer_email ?? "").toLowerCase().includes(q) ||
          (o.customer_name ?? "").toLowerCase().includes(q);
        if (!hay) return false;
      }
      const created = o.created_at.slice(0, 10);
      if (dateFrom && created < dateFrom) return false;
      if (dateTo && created > dateTo) return false;
      return true;
    });
  }, [orders, statusFilter, search, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const revenue = filtered
      .filter((o) => o.status !== "pending" && o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total), 0);
    const pendingPayment = filtered.filter((o) => o.status === "pending").length;
    const toShip = filtered.filter((o) => o.status === "paid").length;
    return { count: filtered.length, revenue, pendingPayment, toShip };
  }, [filtered]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await (supabase as any).from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("No se pudo actualizar el estado");
      console.error(error);
      return;
    }
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
    toast.success("Estado actualizado");
  };

  const exportCsv = () => {
    const headers = [
      "Nº pedido", "Fecha", "Cliente", "Email", "Teléfono", "Estado",
      "Subtotal", "Envío", "Impuestos", "Total",
      "Razón social", "CIF/NIF", "Dirección fiscal",
    ];
    const rows = filtered.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleString("es-ES"),
      o.customer_name ?? "",
      o.customer_email ?? "",
      o.customer_phone ?? "",
      STATUS_LABEL[o.status],
      Number(o.subtotal).toFixed(2),
      Number(o.shipping).toFixed(2),
      Number(o.tax).toFixed(2),
      Number(o.total).toFixed(2),
      o.invoice_data?.companyName ?? "",
      o.invoice_data?.taxId ?? "",
      o.invoice_data?.address ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos_xprintwear_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Estados de carga / acceso ---------------------------------------
  if (authLoading || checking) {
    return <main className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">…</main>;
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-3xl uppercase">Panel interno</p>
        <p className="mt-3 text-sm text-muted-foreground">Inicia sesión con tu cuenta de administradora.</p>
        <Link
          to="/auth"
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-widest text-background"
        >
          Iniciar sesión
        </Link>
      </main>
    );
  }
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-3xl uppercase">Acceso restringido</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta cuenta ({user.email}) no tiene permisos de administradora.
        </p>
      </main>
    );
  }

  // --- Panel --------------------------------------------------------
  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Xprint Wear</p>
          <h1 className="mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
            Panel de pedidos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-wider transition hover:border-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`} /> Actualizar
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="holo-gradient inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats (sobre los pedidos filtrados) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Package className="h-4 w-4" />} label="Pedidos" value={stats.count.toString()} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Facturación" value={`€${stats.revenue.toFixed(2)}`} />
        <Stat icon={<Clock className="h-4 w-4" />} label="Pendientes de pago" value={stats.pendingPayment.toString()} />
        <Stat icon={<Truck className="h-4 w-4" />} label="Por enviar" value={stats.toShip.toString()} />
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <input
          type="text"
          placeholder="Buscar por nº pedido, nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        >
          <option value="all">Todos los estados</option>
          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <span className="text-xs text-muted-foreground">a</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>

      {/* Tabla de pedidos */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {orders === null ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Cargando pedidos…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No hay pedidos con estos filtros.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((o) => (
              <motion.li key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div
                  onClick={() => setExpandedId((id) => (id === o.id ? null : o.id))}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-muted/40"
                >
                  <div className="flex min-w-[160px] items-center gap-3">
                    <div>
                      <p className="font-display text-sm uppercase tracking-widest">{o.order_number}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <p className="truncate text-sm font-medium">{o.customer_name || "—"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{o.customer_email || "—"}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${STATUS_CLS[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                  {o.invoice_data && (
                    <span
                      title="Necesita factura"
                      className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300"
                    >
                      <FileText className="h-3 w-3" /> Factura
                    </span>
                  )}
                  <p className="w-24 text-right font-semibold">€{Number(o.total).toFixed(2)}</p>
                </div>

                {expandedId === o.id && (
                  <div className="border-t border-border bg-muted/20 px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Cambiar estado:</span>
                      {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(o.id, s)}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                            o.status === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                          }`}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>

                    {o.customer_phone && (
                      <p className="mb-2 text-xs text-muted-foreground">Teléfono: {o.customer_phone}</p>
                    )}
                    {o.shipping_address && (
                      <p className="mb-3 text-xs text-muted-foreground">
                        Envío: {Object.values(o.shipping_address).filter(Boolean).join(", ")}
                      </p>
                    )}
                    {o.invoice_data && (
                      <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
                        <p className="mb-1 font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Factura solicitada
                        </p>
                        {o.invoice_data.companyName && <p>Razón social: {o.invoice_data.companyName}</p>}
                        {o.invoice_data.taxId && <p>CIF/NIF: {o.invoice_data.taxId}</p>}
                        {o.invoice_data.address && <p>Dirección fiscal: {o.invoice_data.address}</p>}
                      </div>
                    )}

                    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex items-center gap-3 px-3 py-2">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border" style={{ backgroundColor: "#ffffff" }}>
                            {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-contain mix-blend-multiply" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{i.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {i.size} · {i.colorName} · Cant. {i.qty}
                              {i.elements.some((el) => el.kind === "image") ? " · logo" : ""}
                              {i.elements.some((el) => el.kind === "text" && el.text) ? " · texto" : ""}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 flex justify-end gap-6 text-xs text-muted-foreground">
                      <span>Subtotal: €{Number(o.subtotal).toFixed(2)}</span>
                      <span>Envío: €{Number(o.shipping).toFixed(2)}</span>
                      <span>Impuestos: €{Number(o.tax).toFixed(2)}</span>
                      <span className="font-semibold text-foreground">Total: €{Number(o.total).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-2 font-display text-3xl leading-none">{value}</p>
    </div>
  );
}
