import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { products } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import dropHero from "@/assets/drop-hero.jpg";

export const Route = createFileRoute("/drop")({
  head: () => ({
    meta: [
      { title: "Drop 01 — Merchango" },
      { name: "description", content: "The first Merchango drop. Coming soon." },
      { property: "og:title", content: "Drop 01 — Merchango" },
      { property: "og:description", content: "The first Merchango drop. Coming soon." },
    ],
  }),
  component: Drop,
});

function Drop() {
  const { lang } = useI18n();
  const items = products.slice(0, 24);

  const copy = lang === "es" ? {
    kicker: "Drop 01",
    title: "Muy pronto.",
    sub: "El primer drop de Merchango está en camino. Regístrate abajo para ser el primero en enterarte.",
    discountsTitle: "Sin descuentos disponibles",
    discountsSub: "No hay descuentos activos por el momento.",
    comingSoon: "Muy pronto",
    stayTuned: "Mantente atento",
    notify: "Avísame cuando salga",
  } : {
    kicker: "Drop 01",
    title: "Coming soon.",
    sub: "The first Merchango drop is on its way. Sign up below to be the first to know.",
    discountsTitle: "No discounts available",
    discountsSub: "No available discounts as of now.",
    comingSoon: "Coming soon",
    stayTuned: "Stay tuned",
    notify: "Notify me at launch",
  };

  return (
    <div className="pb-24">
      {/* Hero with background image */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={dropHero}
          alt=""
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] backdrop-blur">
              <Sparkles className="h-3 w-3" /> {copy.kicker}
            </span>
            <h1 className="mt-5 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-7xl md:text-8xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/80">
              {copy.sub}
            </p>

            <div className="mt-8 max-w-md rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
              <p className="font-display text-lg uppercase tracking-tight text-white">
                {copy.discountsTitle}
              </p>
              <p className="mt-1 text-sm text-white/70">{copy.discountsSub}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Items with COMING SOON */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{copy.stayTuned}</p>
            <h2 className="font-display text-3xl uppercase tracking-tight sm:text-5xl">
              {copy.kicker} <span className="text-holo">·</span> {copy.comingSoon}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => {
            const primary = p.colors.find((c) => c.image) ?? p.colors[0];
            return (
              <motion.div
                key={p.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.02 }}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              >
                <div
                  className="relative aspect-square overflow-hidden"
                  style={{ backgroundColor: primary?.hex ? `${primary.hex}22` : "var(--cream)" }}
                >
                  {primary?.image && (
                    <img
                      src={primary.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-4 mix-blend-multiply grayscale transition group-hover:grayscale-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-lg"
                    style={{ background: "linear-gradient(90deg, #ec4899, #a855f7, #3b82f6)" }}
                  >
                    <Clock className="mr-1 inline h-3 w-3" /> {copy.comingSoon}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <p className="truncate font-display text-lg uppercase leading-tight">{p.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{p.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground line-through">
                      €{p.price.toFixed(2)}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {copy.comingSoon}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            to="/about"
            className="holo-gradient inline-flex items-center gap-2 rounded-full px-8 py-4 font-display text-sm uppercase tracking-widest text-white shadow-[var(--gradient-holo-glow)] transition active:scale-95"
          >
            {copy.notify}
          </Link>
        </div>
      </section>
    </div>
  );
}
