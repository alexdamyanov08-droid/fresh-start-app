import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, ShieldCheck, Truck, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Xprint Wear" },
      { name: "description", content: "Secure checkout for your Xprint Wear custom pieces." },
      { property: "og:title", content: "Checkout — Xprint Wear" },
      { property: "og:description", content: "Secure checkout for your Xprint Wear custom pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t } = useI18n();
  const { items, total, unitPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);

  const shipping = total > 120 ? 0 : total > 0 ? 9 : 0;
  const tax = Math.round(total * 0.08 * 100) / 100;
  const grand = total + shipping + tax;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length || busy) return;
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const customerEmail = String(form.get("email") || "").trim();
    const customerPhone = String(form.get("phone") || "").trim();
    const customerName = String(form.get("name") || "").trim();
    const shippingAddress = {
      address: String(form.get("address") || "").trim(),
      city: String(form.get("city") || "").trim(),
      postal: String(form.get("postal") || "").trim(),
      country: String(form.get("country") || "").trim(),
    };
    const invoiceData = wantsInvoice
      ? {
          companyName: String(form.get("invoiceCompany") || "").trim(),
          taxId: String(form.get("invoiceTaxId") || "").trim(),
          address: String(form.get("invoiceAddress") || "").trim(),
        }
      : null;

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          items,
          subtotal: total,
          shipping,
          tax,
          total: grand,
          customerEmail: customerEmail || user?.email || null,
          customerName,
          customerPhone,
          shippingAddress,
          invoiceData,
          origin: window.location.origin,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No se ha recibido la URL de pago");

      window.location.href = data.url;
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar el pago");
    }
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
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Xprint Wear</p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
            {t("checkout_title")} <span className="text-holo">.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t("checkout_sub")}</p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: form */}
          <div className="space-y-8">
            <Section title={t("contact_info")}>
              <Field label={t("email")} name="email" type="email" required placeholder="tucorreo@ejemplo.com" />
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

            <Section title="Facturación" icon={<FileText className="h-4 w-4" />}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={wantsInvoice}
                  onChange={(e) => setWantsInvoice(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-foreground"
                />
                Necesito factura con mis datos fiscales
              </label>
              {wantsInvoice && (
                <div className="space-y-3 pt-1">
                  <Field label="Razón social / Nombre fiscal" name="invoiceCompany" required placeholder="Mi Empresa S.L." />
                  <Field label="CIF / NIF" name="invoiceTaxId" required placeholder="B12345678" />
                  <Field
                    label="Dirección fiscal (si es distinta a la de envío)"
                    name="invoiceAddress"
                    placeholder="Calle Ejemplo 1, 28001 Madrid"
                  />
                </div>
              )}
            </Section>

            <Section title={t("payment")} icon={<Lock className="h-4 w-4" />}>
              <div className="rounded-xl border border-border bg-muted/30 p-5 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                  <Lock className="h-4 w-4" />
                </div>
                <p className="font-display text-sm uppercase tracking-wider">Pago 100% seguro con Stripe</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  En el siguiente paso podrás elegir cómo pagar (tarjeta, Apple Pay, Google Pay, Bizum u otros métodos
                  disponibles) en la pasarela segura de Stripe.
                </p>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Tus datos de pago nunca pasan por nuestros servidores.
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
                      style={{ backgroundColor: "#ffffff" }}
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
                      {i.elements.filter((el) => el.kind === "text" && el.text).map((el) => (
                        <p key={el.id} className="text-[11px] text-muted-foreground">"{el.text}"</p>
                      ))}
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold">
                      €{(unitPrice(i) * i.qty).toFixed(2)}
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
                  {busy ? t("processing") : t("place_order")}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Secure · encrypted · Xprint Wear
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
