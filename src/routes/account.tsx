import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Package, Sparkles, User as UserIcon, ShoppingBag, LogOut, Mail, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/orders-store";
import { unitPriceOf } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Xprint Wear" },
      { name: "description", content: "Your Xprint Wear account: orders, status, and saved designs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const { orders } = useOrders();
  const { t } = useI18n();
  const nav = useNavigate();

  const scoped = useMemo(
    () => orders.filter((o) => !user || !o.userEmail || o.userEmail === user.email),
    [orders, user],
  );

  const totalSpent = scoped.reduce((s, o) => s + o.total, 0);
  const totalItems = scoped.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
  const tier = totalSpent >= 500 ? "Icon" : totalSpent >= 200 ? "Gold" : totalSpent >= 50 ? "Silver" : "Rookie";
  const tierGrad =
    tier === "Icon" ? "from-fuchsia-500 via-purple-500 to-sky-400"
    : tier === "Gold" ? "from-amber-400 via-orange-400 to-rose-400"
    : tier === "Silver" ? "from-slate-300 via-slate-400 to-slate-500"
    : "from-neutral-400 to-neutral-600";

  if (loading) {
    return <main className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">…</main>;
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-3xl uppercase">Account</p>
        <p className="mt-3 text-sm text-muted-foreground">Sign in to see your orders and status.</p>
        <Link
          to="/auth"
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-widest text-background"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const initial = user.email?.[0]?.toUpperCase() ?? "M";
  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const doSignOut = async () => {
    await signOut();
    toast.success(t("auth_success_signout"));
    nav({ to: "/" });
  };

  return (
    <main className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[480px] w-[480px] rounded-full bg-[hsl(280_100%_60%/0.14)] blur-3xl" />
        <div className="absolute right-0 top-72 h-[400px] w-[400px] rounded-full bg-[hsl(200_100%_60%/0.10)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
        >
          <div className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${tierGrad} opacity-30 blur-3xl`} />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${tierGrad} font-display text-3xl uppercase text-white shadow-lg`}>
                {initial}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Xprint Wear member</p>
                <h1 className="mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
                  {user.email?.split("@")[0]}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
                    <Calendar className="h-3 w-3" /> Since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${tierGrad} px-4 py-1.5 font-display text-xs uppercase tracking-widest text-white shadow`}>
                <Sparkles className="h-3.5 w-3.5" /> {tier} tier
              </span>
              <button
                onClick={doSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition hover:border-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> {t("sign_out")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Package className="h-4 w-4" />} label="Total orders" value={scoped.length.toString()} />
          <Stat icon={<ShoppingBag className="h-4 w-4" />} label="Items ordered" value={totalItems.toString()} />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Lifetime spend" value={`€${totalSpent.toFixed(2)}`} />
          <Stat icon={<UserIcon className="h-4 w-4" />} label="Status" value={scoped.length ? "Active" : "New"} />
        </div>

        {/* Orders */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl uppercase tracking-tight">Order history</h2>
            <Link to="/shop" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Continue shopping →
            </Link>
          </div>

          {scoped.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
              <p className="font-display text-lg uppercase">No orders yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Your custom pieces will land here after checkout.</p>
              <Link
                to="/shop"
                className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest text-background"
              >
                Start designing
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {scoped.map((o) => (
                <motion.li
                  key={o.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <p className="font-display text-sm uppercase tracking-widest">{o.number}</p>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={o.status} />
                      <p className="font-semibold">€{o.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <ul className="divide-y divide-border">
                    {o.items.map((i) => (
                      <li key={i.id} className="flex gap-3 px-5 py-3">
                        <div
                          className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border"
                          style={{ backgroundColor: "#ffffff" }}
                        >
                          {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-contain mix-blend-multiply" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-sm uppercase leading-tight">{i.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {i.size} · {i.colorName} · Qty {i.qty}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-medium">€{(unitPriceOf(o.items, i) * i.qty).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
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

function StatusPill({ status }: { status: "processing" | "shipped" | "delivered" }) {
  const map = {
    processing: { label: "Processing", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    shipped: { label: "Shipped", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    delivered: { label: "Delivered", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${map.cls}`}>
      {map.label}
    </span>
  );
}
