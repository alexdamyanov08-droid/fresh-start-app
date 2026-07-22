import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shirt, Pencil, Users, Truck, BadgeCheck, Monitor, ShoppingCart, FileCheck, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "XPRINTWEAR — Personalizamos lo que imagines" },
      { name: "description", content: "Personalización textil y merchandising para peñas, eventos, despedidas, comisiones y empresas. Envíos a toda España." },
      { property: "og:title", content: "XPRINTWEAR — Personalizamos lo que imagines" },
      { property: "og:description", content: "Ropa y merch personalizado para grupos. Diseño gratuito y envíos a toda España." },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { label: "Camisetas", img: "/camiseta.jpg" },
  { label: "Sudaderas", img: "/sudadera.png" },
  { label: "Polos", img: "/polo.png" },
  { label: "Softshells", img: "/softshell.jpg" },
];

const FEATURES = [
  { icon: Shirt, title: "Ropa y merch personalizado", desc: "Camisetas, sudaderas, gorras, bolsas y más." },
  { icon: Pencil, title: "Diseña lo que imagines", desc: "Tú traes la idea, nosotros la hacemos realidad." },
  { icon: Users, title: "Para peñas, eventos y más", desc: "Peñas, comisiones, despedidas, empresas, colegios, clubs…" },
  { icon: Truck, title: "Envíos a toda España", desc: "Rápidos, seguros y con seguimiento." },
  { icon: BadgeCheck, title: "Calidad que se nota", desc: "Materiales de calidad y acabados profesionales." },
];

const STEPS = [
  { icon: Shirt, title: "Elige la prenda que te gusta.", desc: "Explora nuestro catálogo y selecciona tu prenda favorita." },
  { icon: Monitor, title: "Personalízala en nuestro simulador.", desc: "Añade tus diseños, textos y elige colores fácilmente." },
  { icon: ShoppingCart, title: "Confirma el pedido.", desc: "Revisa los detalles y finaliza tu compra de forma segura." },
  { icon: FileCheck, title: "Te enviamos el boceto para que veas el resultado final.", desc: "Recibirás una vista previa para asegurarnos de que todo es perfecto." },
  { icon: PackageCheck, title: "Apruebas y producimos para que te llegue lo antes posible.", desc: "Producimos tu pedido con la máxima calidad y te lo enviamos rápido." },
];

function Home() {
  return (
    <div className="bg-sand">
      {/* HERO */}
      <section className="border-b border-border bg-sand">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-12 md:py-16">
          <div>
            <h1 className="font-display text-4xl uppercase leading-[1.05] text-brand sm:text-5xl md:text-6xl">
              Tu grupo.<br />
              Tu diseño.<br />
              <span className="text-gold">Nosotros lo hacemos real.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-foreground/70">
              Personalización textil y merchandising para peñas, eventos, despedidas, comisiones y mucho más.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-brand-foreground transition hover:bg-brand/90 active:scale-95"
              >
                Ver productos
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 rounded-md border-2 border-brand px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-brand transition hover:bg-brand hover:text-brand-foreground"
              >
                Contáctanos
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="/banner_superior.png"
              alt="Grupos con prendas personalizadas por XPRINTWEAR"
              className="h-full w-full object-cover"
              width={1600}
              height={800}
            />
          </div>
        </div>
      </section>

      {/* FEATURES BLUE BANNER */}
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-brand-foreground/20">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3 px-2 lg:px-6">
              <f.icon className="mt-0.5 h-8 w-8 shrink-0 text-gold" strokeWidth={1.75} />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-foreground/85">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONALIZAR */}
      <section className="bg-sand">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl uppercase tracking-tight text-brand sm:text-4xl">
            ¿Qué quieres personalizar?
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                to="/shop"
                className="group flex flex-col overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-sand">
                  <img
                    src={c.img}
                    alt={c.label}
                    loading="lazy"
                    className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                  <span className="text-sm font-bold uppercase tracking-widest text-brand">{c.label}</span>
                  <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-gold-foreground transition hover:brightness-95"
            >
              Ver todos los productos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ASÍ DE FÁCIL */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl uppercase tracking-tight text-brand sm:text-4xl">
            Así de fácil
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative grid h-24 w-24 place-items-center rounded-full bg-sand">
                  <s.icon className="h-10 w-10 text-brand" strokeWidth={1.5} />
                  <span className="absolute -left-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-brand">{s.title}</h3>
                <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-foreground/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA CONTACTO */}
      <section className="bg-sand pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-brand px-8 py-10 sm:px-12 sm:py-12">
            <span aria-hidden className="absolute -left-4 top-4 text-6xl font-black text-brand-foreground/10">✕</span>
            <span aria-hidden className="absolute -right-2 bottom-4 text-6xl font-black text-brand-foreground/10">✕</span>
            <span aria-hidden className="absolute right-10 top-2 text-4xl font-black text-brand-foreground/10">✕</span>

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-lg">
                <h2 className="font-display text-3xl uppercase leading-tight text-brand-foreground sm:text-4xl">
                  ¿Listo para dar vida <br className="hidden sm:block" />
                  <span className="text-gold">a tu idea?</span>
                </h2>
                <p className="mt-4 text-sm text-brand-foreground/85">
                  Hablemos de tu proyecto. Te ayudamos a crear algo único para tu grupo.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden text-lg italic text-gold sm:inline">¡Te esperamos!</span>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 text-sm font-bold uppercase tracking-widest text-gold-foreground transition hover:brightness-95"
                >
                  Contáctanos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
