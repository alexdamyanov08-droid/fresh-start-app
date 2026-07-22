import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Package, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { z } from "zod";

const searchSchema = z.object({ order: z.string().optional() });

export const Route = createFileRoute("/thanks")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Thank you — Merchango" },
      { name: "description", content: "Your Merchango order is confirmed. Custom pieces are entering production." },
      { property: "og:title", content: "Thank you — Merchango" },
      { property: "og:description", content: "Your Merchango order is confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThanksPage,
});

function ThanksPage() {
  const { t } = useI18n();
  const { order } = Route.useSearch();
  const num = order || "MRC-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  return (
    <main className="relative overflow-hidden">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute -left-32 top-10 h-[520px] w-[520px] rounded-full bg-[hsl(280_100%_60%/0.18)] blur-3xl" />
        <div className="absolute right-0 top-40 h-[460px] w-[460px] rounded-full bg-[hsl(320_100%_60%/0.16)] blur-3xl" />
        <div className="absolute left-1/2 top-96 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[hsl(200_100%_60%/0.12)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.4em] text-muted-foreground"
        >
          Merchango
        </motion.p>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
          className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-full holo-gradient shadow-[0_20px_60px_-15px_rgba(139,0,255,0.5)]"
        >
          <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.4} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl"
        >
          {t("thanks_title")} <span className="text-holo">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          {t("thanks_sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/70 px-5 py-2.5 backdrop-blur"
        >
          <Sparkles className="h-4 w-4 text-holo" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("order_number")}</span>
          <span className="font-mono text-sm font-bold">{num}</span>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-14 grid max-w-2xl gap-4 sm:grid-cols-3"
        >
          <Step icon={<CheckCircle2 className="h-5 w-5" />} title="Confirmed" note="Payment received" active />
          <Step icon={<Package className="h-5 w-5" />} title="In production" note="24–72 hours" />
          <Step icon={<Mail className="h-5 w-5" />} title="Tracking" note="Sent by email" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/shop"
            className="rounded-full bg-foreground px-8 py-3 text-sm font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
          >
            {t("continue_shopping")}
          </Link>
          <Link
            to="/"
            className="rounded-full border border-border px-8 py-3 text-sm font-semibold uppercase tracking-widest transition hover:border-foreground"
          >
            {t("back_home")}
          </Link>
        </motion.div>

        <p className="mt-16 font-display text-2xl uppercase tracking-tight text-muted-foreground/60">
          MERCH<span className="text-holo">·</span>ANGO
        </p>
      </div>
    </main>
  );
}

function Step({
  icon,
  title,
  note,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-foreground/40 bg-card shadow-sm"
          : "border-border bg-card/50 text-muted-foreground"
      }`}
    >
      <div
        className={`mb-2 grid h-9 w-9 place-items-center rounded-full ${
          active ? "holo-gradient text-white" : "bg-muted"
        }`}
      >
        {icon}
      </div>
      <p className="font-display text-sm uppercase tracking-widest">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
