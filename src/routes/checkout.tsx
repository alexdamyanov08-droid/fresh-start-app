import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { useOrders } from "@/lib/orders-store";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Merchango" },
      { name: "description", content: "Secure checkout for your Merchango custom pieces." },
      { property: "og:title", content: "Checkout — Merchango" },
      { property: "og:description", content: "Secure checkout for your Merchango custom pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t } = useI18n();
  const { items, total, clear } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [payMethod, setPayMethod] = useState<"card" | "apple" | "google" | "paypal" | "revolut" | "klarna">("card");

  const shipping = total > 120 ? 0 : total > 0 ? 9 : 0;
  const tax = Math.round(total * 0.08 * 100) / 100;
  const grand = total + shipping + tax;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) return;
    setBusy(true);
    const orderNumber = "MRC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const snapshot = items;
    setTimeout(() => {
      addOrder({
        number: orderNumber,
        items: snapshot,
        subtotal: total,
        shipping,
        tax,
        total: grand,
        userEmail: user?.email ?? null,
      });
      clear();
      navigate({ to: "/thanks", search: { order: orderNumber } });
    }, 1100);
  };


  if (!items.length) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-display text-3xl uppercase">{t("checkout_title")}</p>
        <p className="mt-4 text-muted-foreground">{t("empty_checkout")}</p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-widest transition hover:bg-foreground hover:text-background"
        >
          {t("continue_shopping")}
        </Link>
      </main>
    );
  }

  return (
    <main className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[hsl(280_100%_60%/0.12)] blur-3xl" />
        <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-[hsl(320_100%_60%/0.10)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("back_to_shop")}
        </button>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Merchango</p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            {t("checkout_title")} <span className="text-holo">.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t("checkout_sub")}</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: form */}
          <div className="space-y-8">
            <Section title={t("contact_info")}>
              <Field label={t("email")} name="email" type="email" required placeholder="you@merchango.es" />
              <Field label={t("phone")} name="phone" type="tel" placeholder="+34 600 000 000" />
            </Section>

            <Section title={t("shipping_address")} icon={<Truck className="h-4 w-4" />}>
              <Field label={t("full_name")} name="name" required placeholder="Alex Rivera" />
              <Field label={t("address_line")} name="address" required placeholder="Calle Gran Vía 42" />
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("city")} name="city" required placeholder="Madrid" />
                <Field label={t("postal_code")} name="postal" required placeholder="28013" />
              </div>
              <Field label={t("country")} name="country" required placeholder="España" />
            </Section>

            <Section title={t("payment")} icon={<Lock className="h-4 w-4" />}>
              <div className="mb-1">
                <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">{t("pay_method")}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {(
                    [
                      { id: "card", label: t("pay_card") },
                      { id: "apple", label: t("pay_apple") },
                      { id: "google", label: t("pay_google") },
                      { id: "paypal", label: t("pay_paypal") },
                      { id: "revolut", label: t("pay_revolut") },
                      { id: "klarna", label: t("pay_klarna") },
                    ] as const
                  ).map((m) => {
                    const active = payMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        aria-pressed={active}
                        className={`group relative flex h-14 items-center justify-center rounded-xl border px-2 text-[11px] font-semibold uppercase tracking-widest transition ${
                          active
                            ? "border-foreground bg-foreground text-background shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                        }`}
                      >
                        <PayIcon id={m.id} active={active} />
                        <span className="sr-only">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {payMethod === "card" && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="space-y-3 pt-1"
                  >
                    <Field label={t("card_number")} name="card" required placeholder="4242 4242 4242 4242" inputMode="numeric" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("card_expiry")} name="exp" required placeholder="12 / 27" />
                      <Field label={t("card_cvc")} name="cvc" required placeholder="123" inputMode="numeric" />
                    </div>
                  </motion.div>
                )}

                {(payMethod === "apple" || payMethod === "google") && (
                  <motion.div
                    key={payMethod}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center">
                      <PayIcon id={payMethod} active />
                    </div>
                    <p className="font-display text-sm uppercase tracking-wider">
                      {payMethod === "apple" ? t("pay_apple") : t("pay_google")}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{t("pay_wallet_note")}</p>
                  </motion.div>
                )}

                {(payMethod === "paypal" || payMethod === "revolut" || payMethod === "klarna") && (
                  <motion.div
                    key={payMethod}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center">
                      <PayIcon id={payMethod} active />
                    </div>
                    <p className="font-display text-sm uppercase tracking-wider">
                      {payMethod === "paypal" ? t("pay_paypal") : payMethod === "revolut" ? t("pay_revolut") : t("pay_klarna")}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{t("pay_redirect_note")}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> {t("demo_note")}
              </p>
            </Section>
          </div>

          {/* Right: summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border bg-muted/40 px-5 py-4">
                <p className="font-display text-lg uppercase tracking-tight">{t("order_summary")}</p>
              </div>

              <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 px-5 py-4">
                    <div
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border"
                      style={{ backgroundColor: i.colorHex }}
                    >
                      {i.image && (
                        <img src={i.image} alt={i.name} className="h-full w-full object-contain mix-blend-multiply" />
                      )}
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                        {i.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm uppercase leading-tight">{i.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {i.size} · {i.colorName}
                      </p>
                      {i.customText && (
                        <p className="text-[11px] text-muted-foreground">"{i.customText}"</p>
                      )}
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold">
                      €{(i.unitPrice * i.qty).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
                <Row label={t("subtotal")} value={`€${total.toFixed(2)}`} />
                <Row label={t("shipping")} value={shipping === 0 ? t("free") : `€${shipping.toFixed(2)}`} />
                <Row label={t("tax")} value={`€${tax.toFixed(2)}`} />
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-display text-lg uppercase">
                  <span>{t("total")}</span>
                  <span>€{grand.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border p-5">
                <button
                  type="submit"
                  disabled={busy}
                  className="holo-gradient relative w-full overflow-hidden rounded-full py-4 font-display text-sm uppercase tracking-[0.2em] text-white shadow-lg transition active:scale-[0.98] disabled:opacity-70"
                >
                  {busy
                    ? t("processing")
                    : payMethod === "apple"
                    ? `Pay with ${t("pay_apple")}`
                    : payMethod === "google"
                    ? `Pay with ${t("pay_google")}`
                    : payMethod === "paypal"
                    ? `Continue with ${t("pay_paypal")}`
                    : payMethod === "revolut"
                    ? `Continue with ${t("pay_revolut")}`
                    : payMethod === "klarna"
                    ? `Continue with ${t("pay_klarna")}`
                    : t("place_order")}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Secure · encrypted · Merchango
                </p>
              </div>
            </motion.div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-widest">
        {icon}
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function PayIcon({ id, active }: { id: "card" | "apple" | "google" | "paypal" | "revolut" | "klarna"; active: boolean }) {
  const c = active ? "currentColor" : "currentColor";
  const common = "h-6 w-auto";
  if (id === "card")
    return (
      <svg viewBox="0 0 40 24" className={common} fill="none" stroke={c} strokeWidth="1.6">
        <rect x="1" y="1" width="38" height="22" rx="3" />
        <path d="M1 8h38" strokeWidth="2" />
        <rect x="6" y="14" width="10" height="3" rx="0.5" fill={c} stroke="none" />
      </svg>
    );
  if (id === "apple")
    return (
      <svg viewBox="0 0 46 20" className={common} fill={c}>
        <path d="M8.2 4.5c.5-.6.8-1.5.7-2.3-.7 0-1.6.5-2.1 1.1-.5.5-.9 1.4-.8 2.2.8.1 1.6-.4 2.2-1zm.7.9c-1.2-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.5-.6-1.3 0-2.4.7-3.1 1.9-1.3 2.3-.3 5.7 1 7.5.6.9 1.4 1.9 2.4 1.9.9 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-.9 2.3-1.8c.7-1.1 1-2.1 1-2.1s-1.9-.7-1.9-2.9c0-1.9 1.5-2.7 1.6-2.8-.9-1.3-2.2-1.5-2.7-1.5zM19 5.2h2.9c2.6 0 4.3 1.7 4.3 4.4s-1.8 4.5-4.4 4.5H19V5.2zm1.6 1.4v6.1h1.1c1.7 0 2.7-1.1 2.7-3s-1-3.1-2.7-3.1h-1.1zm7.4 5.4c0-1.5 1.1-2.4 3.1-2.5l2.1-.1v-.6c0-.9-.6-1.4-1.6-1.4-.9 0-1.5.4-1.7 1.1H28.5c.1-1.6 1.4-2.6 3.3-2.6 2 0 3.3 1.1 3.3 2.8v4.5h-1.5v-1.1h0c-.4.7-1.3 1.2-2.4 1.2-1.5 0-2.6-1-2.6-2.3zm5.2-.8v-.6l-1.9.1c-1 .1-1.5.5-1.5 1.2s.5 1.1 1.4 1.1c1.1 0 2-.8 2-1.8zm4-6.7h1.6v2.4h1.9v1.3h-1.9v3.9c0 .8.4 1.2 1.2 1.2.2 0 .5 0 .7-.1v1.3c-.3.1-.7.1-1.1.1-1.5 0-2.4-.7-2.4-2.2V8.2h-1.4V6.9h1.4V4.5z" />
      </svg>
    );
  if (id === "google")
    return (
      <svg viewBox="0 0 48 20" className={common} fill={c}>
        <path d="M6.4 10.3c0-.5 0-1-.1-1.4H1v2.7h3.1c-.1.7-.6 1.8-1.6 2.5l2.4 1.9c1.4-1.3 2.5-3.3 2.5-5.7zM1 16c1.4 0 2.6-.5 3.5-1.3l-1.7-1.3c-.5.3-1.1.5-1.8.5-1.4 0-2.6-.9-3-2.2H-3.7v1.4C-2.8 14.8-1 16 1 16zM-2 11.7c-.1-.3-.2-.7-.2-1.1s.1-.8.2-1.1V8.1H-3.7c-.4.7-.6 1.5-.6 2.4s.2 1.7.6 2.4L-2 11.7zM1 6.7c1 0 1.7.4 2.1.8L4.6 6c-.9-.9-2.1-1.4-3.6-1.4-2 0-3.8 1.2-4.7 2.9l1.7 1.3c.4-1.3 1.6-2.1 3-2.1zM14.6 10c0 2.5-1.9 4.4-4.4 4.4S5.8 12.5 5.8 10s1.9-4.4 4.4-4.4 4.4 1.9 4.4 4.4zm-1.9 0c0-1.5-1.1-2.6-2.5-2.6S7.7 8.5 7.7 10s1.1 2.6 2.5 2.6 2.5-1.1 2.5-2.6zm10.6 0c0 2.5-1.9 4.4-4.4 4.4s-4.4-1.9-4.4-4.4 1.9-4.4 4.4-4.4 4.4 1.9 4.4 4.4zm-1.9 0c0-1.5-1.1-2.6-2.5-2.6s-2.5 1.1-2.5 2.6 1.1 2.6 2.5 2.6 2.5-1.1 2.5-2.6zm11.1-4.1v7.8c0 3.2-1.9 4.5-4.1 4.5-2.1 0-3.4-1.4-3.8-2.6l1.7-.7c.3.7 1 1.5 2.1 1.5 1.4 0 2.3-.9 2.3-2.5v-.6h-.1c-.4.5-1.2 1-2.3 1-2.2 0-4.2-1.9-4.2-4.4s2-4.4 4.2-4.4c1.1 0 1.9.5 2.3.9h.1v-.7h1.8zm-1.7 4.1c0-1.5-1-2.6-2.3-2.6s-2.5 1.1-2.5 2.6 1.1 2.6 2.5 2.6 2.3-1.1 2.3-2.6zm5-8.5v12h-1.9v-12h1.9zm7.4 9.4l1.5.9c-.5.7-1.7 2-3.7 2-2.5 0-4.3-1.9-4.3-4.4 0-2.6 1.9-4.4 4.1-4.4s3.4 1.8 3.8 2.7l.2.5-5.8 2.4c.5.9 1.2 1.4 2.2 1.4s1.7-.5 2.2-1.2zm-4.6-1.6l3.9-1.6c-.2-.5-.9-.9-1.7-.9-1 0-2.3.9-2.2 2.5z" />
      </svg>
    );
  if (id === "paypal")
    return (
      <svg viewBox="0 0 40 20" className={common} fill={c}>
        <path d="M15.5 4.5h-5c-.4 0-.7.3-.7.6l-2 12.7c0 .3.1.5.4.5h2.4c.4 0 .7-.3.7-.6l.5-3.4c.1-.4.4-.6.7-.6h1.6c3.3 0 5.2-1.6 5.7-4.8.2-1.4 0-2.5-.6-3.3-.7-.7-1.9-1.1-3.7-1.1zm.6 4.7c-.3 1.8-1.6 1.8-2.9 1.8h-.7l.5-3.2c0-.2.2-.3.4-.3h.3c.9 0 1.7 0 2.1.5.2.3.3.7.3 1.2zm12.8-.1H26.5c-.2 0-.4.1-.4.3l-.1.7-.2-.2c-.5-.7-1.6-1-2.7-1-2.5 0-4.7 1.9-5.1 4.6-.2 1.3.1 2.6.9 3.5.7.8 1.7 1.2 2.9 1.2 2 0 3.2-1.3 3.2-1.3l-.1.7c0 .3.1.5.4.5h2.2c.4 0 .7-.3.7-.6l1.3-8.3c0-.3-.1-.5-.4-.5zm-3.4 4.5c-.2 1.3-1.2 2.2-2.6 2.2-.7 0-1.2-.2-1.6-.6-.4-.4-.5-1-.4-1.6.2-1.3 1.3-2.2 2.6-2.2.7 0 1.2.2 1.5.7.4.4.6 1 .5 1.5zM38 9.1h-2.4c-.2 0-.4.1-.5.3l-3.4 4.9-1.4-4.8c-.1-.3-.3-.5-.6-.5H27c-.3 0-.6.3-.5.6l2.8 8.1-2.6 3.7c-.2.3 0 .7.3.7H29.5c.2 0 .4-.1.5-.3l8.3-11.9c.3-.3.1-.7-.3-.7z" />
      </svg>
    );
  if (id === "revolut")
    return (
      <svg viewBox="0 0 40 20" className={common} fill={c}>
        <path d="M4 4h6.5c2.7 0 4.8 2 4.8 4.5 0 1.9-1.2 3.5-2.9 4.1L15.8 18h-3.4l-3.1-5H7.1v5H4V4zm3.1 2.7v3.7h3.1c1.1 0 1.9-.8 1.9-1.9s-.8-1.8-1.9-1.8H7.1zM18 8.1c2.4 0 4.4 2 4.4 4.5v.5h-6c.3 1.2 1.2 1.9 2.4 1.9.9 0 1.6-.3 2.1-.9l1.7 1.4c-.9 1.1-2.3 1.8-3.9 1.8-2.6 0-4.5-1.9-4.5-4.6 0-2.6 1.9-4.6 3.8-4.6zm-1.6 3.6h3.4c-.2-1-1-1.7-1.9-1.7-.8 0-1.4.7-1.5 1.7zM22.7 8.3h2.8l1.6 5 1.6-5h2.7L28.5 18h-2.4l-2.6-9.7zM32.8 4h2.9v14h-2.9V4z" />
      </svg>
    );
  // klarna
  return (
    <svg viewBox="0 0 46 20" className={common} fill={c}>
      <path d="M6.2 4H3v14h3.2V4zm4.7 0c0 2.9-1.1 5.6-3 7.6l4.4 6.4h4l-4-5.9c1.8-2.3 2.9-5.1 2.9-8.1h-4.3zm10.9 5.6c-.7 0-1.4.3-1.8.7v-.5h-2.7V18h2.8v-4.5c0-1.1.6-1.8 1.6-1.8 1 0 1.5.6 1.5 1.8V18h2.8v-5.1c0-2-1.5-3.3-4.2-3.3zm10.1 0c-2.4 0-4.4 1.9-4.4 4.3s2 4.3 4.4 4.3c1 0 1.9-.3 2.4-.9v.7h2.8V9.8h-2.8v.7c-.5-.6-1.4-.9-2.4-.9zm.4 6.2c-1.2 0-2-.8-2-1.9s.9-1.9 2-1.9 2 .8 2 1.9-.9 1.9-2 1.9zm7.7-6c-.8 0-1.6.3-2 .9v-.7h-2.7V18h2.7v-4c0-1.3.7-2.1 1.9-2.1.3 0 .5 0 .8.1V9.7c-.2 0-.4-.1-.7 0zm3 5c-.9 0-1.7.7-1.7 1.7s.7 1.7 1.7 1.7 1.7-.7 1.7-1.7-.8-1.7-1.7-1.7z" />
    </svg>
  );
}
