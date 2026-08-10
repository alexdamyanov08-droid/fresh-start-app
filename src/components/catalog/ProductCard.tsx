import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { getVariant } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { MODEL_IMAGES } from "@/data/model-images";
import { isKidSize } from "@/lib/sizes";

export function ProductCard({ p, i }: { p: Product; i: number }) {
  const { tr } = useI18n();
  const primary = p.colors.find((c) => c.image) ?? p.colors[0];
  const colorNameForPrice = primary?.name ?? "";
  const fromPriceKid = (() => {
    const prices = p.sizes
      .filter((s) => isKidSize(s))
      .map((s) => getVariant(p, s, colorNameForPrice)?.tiers?.t1_10)
      .filter((n): n is number => typeof n === "number");
    return prices.length ? Math.min(...prices) : null;
  })();
  const fromPriceAdult = (() => {
    const prices = p.sizes
      .filter((s) => !isKidSize(s))
      .map((s) => getVariant(p, s, colorNameForPrice)?.tiers?.t1_10)
      .filter((n): n is number => typeof n === "number");
    return prices.length ? Math.min(...prices) : null;
  })();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i, 12) * 0.02, duration: 0.35 }}
    >
      <Link
        to="/product/$code"
        params={{ code: p.code }}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={{ backgroundColor: "#ffffff" }}
        >
          {primary?.image && (
            <img
              src={MODEL_IMAGES[p.code] ?? primary.image}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {tr(p.family) || "Drop"}
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <p translate="no" className="notranslate truncate font-display text-lg uppercase leading-tight">{p.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{tr(p.category)}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
              {fromPriceKid != null && (
                <span className="font-semibold">
                  Desde €{fromPriceKid.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">Niño</span>
                </span>
              )}
              {fromPriceAdult != null && (
                <span className="font-semibold">
                  Desde €{fromPriceAdult.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">Adulto</span>
                </span>
              )}
              {fromPriceKid == null && fromPriceAdult == null && (
                <span className="font-semibold">€{p.price.toFixed(2)}</span>
              )}
            </div>
            <div className="flex -space-x-1">
              {p.colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-background"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {p.colors.length > 4 && (
                <span className="ml-1.5 text-[10px] text-muted-foreground">+{p.colors.length - 4}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
