import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Phone, ArrowRight, ShieldCheck, FileEdit, Lightbulb, Truck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import contactHero from "@/assets/contact-hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Contact — Xprint Wear" },
      { name: "description", content: "Tell us your idea. We help brands, events and companies create custom merchandise." },
      { property: "og:title", content: "About & Contact — Xprint Wear" },
      { property: "og:description", content: "Tell us your idea. We help brands, events and companies create custom merchandise." },
    ],
  }),
  component: About,
});

function About() {
  const { t, lang } = useI18n();
  const [sent, setSent] = useState(false);

  const copy = lang === "es" ? {
    kicker: "Nosotros",
    title1: "Diseñado por ti,",
    title2: "hecho por nosotros.",
    lead: "Xprint Wear es un estudio de merchandising personalizado. Ayudamos a marcas, eventos y empresas a crear piezas únicas — desde una sola muestra hasta miles de unidades.",
    stat1: "150+", stat1l: "Piezas base",
    stat2: "24h", stat2l: "Respuesta media",
    stat3: "100%", stat3l: "Personalizable",
    heroLine: "Cuéntanos qué necesitas y te ayudaremos a encontrar el producto perfecto para ",
    heroBold: "tu marca, evento o empresa.",
    f1: "Asesoramiento personalizado", f2: "Ideas creativas y originales", f3: "Producción rápida y fiable",
    ch: "Contáctanos",
    hEmail: "EMAIL", hWa: "WHATSAPP", hPhone: "TELÉFONO", hours: "7:00 – 15:00",
    cardTitle: "Cuéntanos", cardTitle2: "tu idea",
    cardSub: "Rellena el formulario y te contactaremos lo antes posible.",
    name: "Nombre", company: "Empresa", optional: "(opcional)",
    email: "Email", phone: "Teléfono",
    idea: "Cuéntanos tu idea",
    productType: "¿Qué tipo de producto buscas?",
    qty: "Cantidad aproximada",
    qtyPlaceholder: "Selecciona una opción",
    productPh: "Ej: camisetas, sudaderas, gorras…",
    ideaPh: "Cuéntanos qué necesitas, para qué, ideas que tengas…",
    submit: "Solicitar propuesta",
    secure: "Tu información está segura y solo se usará para responderte.",
    thanks: "¡Gracias! Nos pondremos en contacto pronto.",
    success: "Mensaje enviado",
    namePh: "Tu nombre", companyPh: "Nombre de tu empresa",
  } : {
    kicker: "About us",
    title1: "Designed by you,",
    title2: "made by us.",
    lead: "Xprint Wear is a custom merchandise studio. We help brands, events and companies create unique pieces — from a single sample to thousands of units.",
    stat1: "150+", stat1l: "Base pieces",
    stat2: "24h", stat2l: "Avg. response",
    stat3: "100%", stat3l: "Customizable",
    heroLine: "Tell us what you need and we'll help you find the perfect product for ",
    heroBold: "your brand, event or company.",
    f1: "Personalized advice", f2: "Creative & original ideas", f3: "Fast, reliable production",
    ch: "Contact us",
    hEmail: "EMAIL", hWa: "WHATSAPP", hPhone: "PHONE", hours: "7:00 – 15:00",
    cardTitle: "Tell us", cardTitle2: "your idea",
    cardSub: "Fill in the form and we'll get back to you as soon as possible.",
    name: "Name", company: "Company", optional: "(optional)",
    email: "Email", phone: "Phone",
    idea: "Tell us your idea",
    productType: "What type of product?",
    qty: "Approx. quantity",
    qtyPlaceholder: "Select an option",
    productPh: "E.g. t-shirts, hoodies, caps…",
    ideaPh: "Tell us what you need, what it's for, any ideas…",
    submit: "Request proposal",
    secure: "Your info is safe and only used to reply to you.",
    thanks: "Thanks! We'll be in touch shortly.",
    success: "Message sent",
    namePh: "Your name", companyPh: "Your company name",
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success(copy.success);
  };

  return (
    <div className="pb-20">
      {/* About hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #ec489955, transparent 70%)" }} />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #a855f755, transparent 70%)" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{copy.kicker}</p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            {copy.title1} <br />
            <span className="text-holo">{copy.title2}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground">{copy.lead}</p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl">
            {[
              { n: copy.stat1, l: copy.stat1l },
              { n: copy.stat2, l: copy.stat2l },
              { n: copy.stat3, l: copy.stat3l },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-4">
                <p className="font-display text-2xl sm:text-4xl">{s.n}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact banner with image */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <img
            src={contactHero}
            alt=""
            width={1600}
            height={600}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          <div className="relative grid gap-6 p-6 sm:p-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-tight sm:text-4xl">
                {copy.ch}
              </h2>
              <p className="mt-3 max-w-md text-sm text-foreground/90 sm:text-base">
                {copy.heroLine}<span className="font-semibold text-foreground">{copy.heroBold}</span>
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {[
                  { i: ShieldCheck, l: copy.f1 },
                  { i: Lightbulb, l: copy.f2 },
                  { i: Truck, l: copy.f3 },
                ].map(({ i: Icon, l }) => (
                  <div key={l} className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur">
                    <Icon className="h-3.5 w-3.5 text-[color:var(--purple-neon)]" /> {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact channels */}
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3 sm:p-8">
          {[
            { i: Mail, h: copy.hEmail, v: "info@merchango.es", href: "mailto:info@merchango.es", bg: "#ec489922", fg: "#ec4899" },
            { i: MessageCircle, h: copy.hWa, v: "876 441 275", href: "https://wa.me/34876441275", bg: "#a855f722", fg: "#a855f7" },
            { i: Phone, h: copy.hPhone, v: "876 441 275", href: "tel:+34876441275", bg: "#3b82f622", fg: "#3b82f6", sub: copy.hours },
          ].map(({ i: Icon, h, v, href, bg, fg, sub }) => (
            <a key={h} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-muted">
              <span className="grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: bg, color: fg }}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</p>
                <p className="font-display text-lg">{v}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Form card */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] md:grid-cols-[340px_1fr]">
          <div className="relative flex flex-col justify-between overflow-hidden p-8" style={{ background: "linear-gradient(160deg, #faf5ff 0%, #fce7f3 100%)" }}>
            <div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white shadow">
                <FileEdit className="h-6 w-6 text-[color:var(--purple-neon)]" />
              </div>
              <h3 className="mt-8 font-display text-3xl uppercase leading-tight text-foreground">
                {copy.cardTitle}
                <br />
                <span className="text-holo">{copy.cardTitle2}</span>
              </h3>
              <p className="mt-4 max-w-[240px] text-sm text-foreground/70">{copy.cardSub}</p>
            </div>
            <div
              className="mt-10 h-40 w-40 self-start rounded-full"
              style={{ background: "linear-gradient(135deg, #ec4899, #a855f7 60%, #3b82f6)" }}
            />
          </div>

          <div className="p-6 sm:p-10">
            {sent ? (
              <div className="grid place-items-center py-16 text-center">
                <CheckCircle className="h-14 w-14 text-[color:var(--purple-neon)]" />
                <h4 className="mt-4 font-display text-2xl uppercase">{copy.success}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{copy.thanks}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
                <Field label={copy.name} required placeholder={copy.namePh} />
                <Field label={copy.company} optional optionalLabel={copy.optional} placeholder={copy.companyPh} />
                <Field label={copy.email} required type="email" placeholder="tu@email.com" />
                <Field label={copy.phone} optional optionalLabel={copy.optional} placeholder="+34 600 000 000" />
                <div className="sm:col-span-2">
                  <Label required>{copy.idea}</Label>
                  <textarea
                    required
                    rows={5}
                    placeholder={copy.ideaPh}
                    className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
                  />
                </div>
                <Field label={copy.productType} required placeholder={copy.productPh} />
                <div>
                  <Label required>{copy.qty}</Label>
                  <select required defaultValue="" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground">
                    <option value="" disabled>{copy.qtyPlaceholder}</option>
                    <option>1 – 24</option>
                    <option>25 – 99</option>
                    <option>100 – 499</option>
                    <option>500 – 999</option>
                    <option>1000+</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex flex-col-reverse items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" /> {copy.secure}
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-sm uppercase tracking-widest text-white shadow-lg transition active:scale-95"
                    style={{ background: "linear-gradient(90deg, #f97316, #ec4899)" }}
                  >
                    {copy.submit} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold">
      {children} {required && <span className="text-[color:var(--purple-neon)]">*</span>}
    </label>
  );
}

function Field({
  label, placeholder, type = "text", required, optional, optionalLabel,
}: {
  label: string; placeholder?: string; type?: string; required?: boolean; optional?: boolean; optionalLabel?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">
        {label}{" "}
        {required && <span className="text-[color:var(--purple-neon)]">*</span>}
        {optional && <span className="text-xs font-normal text-muted-foreground">{optionalLabel}</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
      />
    </div>
  );
}
