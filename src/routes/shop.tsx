import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop the Drop — Merchango" },
      { name: "description", content: "150 streetwear pieces. Fully customizable. Yours to design." },
      { property: "og:title", content: "Shop the Drop — Merchango" },
      { property: "og:description", content: "150 streetwear pieces. Fully customizable." },
    ],
  }),
  component: Shop,
});

const PAGE = 24;

function Shop() {
  const { t, tr } = useI18n();
  const [q, setQ] = useState("");
  const [family, setFamily] = useState<string>("__all");
  const [gender, setGender] = useState<string>("__all");
  const [page, setPage] = useState(1);

  const families = useMemo(
    () => Array.from(new Set(products.map((p) => p.family).filter(Boolean))).sort(),
    [],
  );
  const genders = useMemo(
    () => Array.from(new Set(products.map((p) => p.gender).filter(Boolean))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (family !== "__all" && p.family !== family) return false;
      if (gender !== "__all" && p.gender !== gender) return false;
      if (term && !(p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [q, family, gender]);

  const paged = filtered.slice(0, page * PAGE);
  const canLoadMore = paged.length < filtered.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("hero_kicker")}</p>
        <h1 className="font-display text-4xl uppercase tracking-tight sm:text-6xl">{t("shop_title")}</h1>
        <p className="max-w-xl text-sm text-muted-foreground">{t("shop_sub")}</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder={t("filter_search")}
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-foreground"
          />
        </div>
        <select
          value={family}
          onChange={(e) => { setFamily(e.target.value); setPage(1); }}
          className="rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none"
          aria-label={t("filter_category")}
        >
          <option value="__all">{t("filter_all")} · {t("filter_category")}</option>
          {families.map((f) => <option key={f} value={f}>{tr(f)}</option>)}
        </select>
        <select
          value={gender}
          onChange={(e) => { setGender(e.target.value); setPage(1); }}
          className="rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none"
          aria-label={t("filter_gender")}
        >
          <option value="__all">{t("filter_all")} · {t("filter_gender")}</option>
          {genders.map((g) => <option key={g} value={g}>{tr(g)}</option>)}
        </select>
      </div>

      {paged.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-border py-24">
          <p className="font-display text-2xl uppercase">{t("empty_title")}</p>
          <p className="text-sm text-muted-foreground">{t("empty_sub")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((p, i) => <ProductCard key={p.code} p={p} i={i} />)}
          </div>
          {canLoadMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setPage((n) => n + 1)}
                className="rounded-full border border-foreground px-6 py-3 font-display text-xs uppercase tracking-widest transition hover:bg-foreground hover:text-background"
              >
                {t("load_more")} ({filtered.length - paged.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
