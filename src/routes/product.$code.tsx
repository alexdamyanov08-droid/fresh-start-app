import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getProduct, getVariant, products } from "@/data/products";
import { Viewer, type View } from "@/components/customizer/Viewer";
import { ControlPanel } from "@/components/customizer/ControlPanel";
import { useCart, type DesignElement } from "@/lib/cart-store";
import { basePriceForVariant, surchargeOf } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/product/$code")({
  validateSearch: z.object({ edit: z.string().optional() }),
  loader: ({ params }) => {
    const p = getProduct(params.code);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Merchango` },
          { name: "description", content: `Customize the ${loaderData.name}. ${loaderData.desc}` },
          { property: "og:title", content: `${loaderData.name} — Merchango` },
          { property: "og:description", content: `Customize the ${loaderData.name}.` },
          ...(loaderData.colors[0]?.image
            ? [{ property: "og:image", content: loaderData.colors[0].image }]
            : []),
        ]
      : [{ title: "Product — Merchango" }],
  }),
  component: ProductPage,
  notFoundComponent: NotFoundInline,
});

function NotFoundInline() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="font-display text-2xl uppercase">Product not found</p>
    </div>
  );
}

function ProductPage() {
  const p = Route.useLoaderData();
  const { edit } = Route.useSearch();
  const nav = useNavigate();
  const { items, add, update, setOpen } = useCart();
  const { t } = useI18n();

  const editing = edit ? items.find((i) => i.id === edit) : null;
  const isEdit = Boolean(editing);

  const [size, setSize] = useState(editing?.size ?? p.sizes[Math.min(2, p.sizes.length - 1)]);
  const [color, setColor] = useState(
    editing ? (p.colors.find((c: typeof p.colors[number]) => c.name === editing.colorName) ?? p.colors[0])
    : (p.colors.find((c: typeof p.colors[number]) => c.image) ?? p.colors[0])
  );

  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [view, setView] = useState<View>("front");
  const [elements, setElements] = useState<DesignElement[]>(editing?.elements ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // If ?edit points to an item that no longer exists, drop the param
  useEffect(() => {
    if (edit && !editing) nav({ to: "/product/$code", params: { code: p.code }, search: {}, replace: true });
  }, [edit, editing, nav, p.code]);

  const addImage = (dataUrl: string) => {
    const el: DesignElement = {
      id: crypto.randomUUID(), kind: "image", image: dataUrl,
      size: 25, pos: { x: 0, y: -10 },
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const addText = () => {
    const el: DesignElement = {
      id: crypto.randomUUID(), kind: "text", text: "", font: "brutal", color: "#0a0a0a",
      size: 24, pos: { x: 0, y: -10 },
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const updateElement = (id: string, patch: Partial<DesignElement>) =>
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)));

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedId((sel) => (sel === id ? null : sel));
  };

  const variant = useMemo(() => getVariant(p, size, color.name), [p, size, color.name]);
  const surcharge = useMemo(() => surchargeOf(elements), [elements]);

  // Unidades de esta MISMA referencia ya en el carrito (sin contar la línea que
  // se está editando), más las que se van a añadir ahora: eso decide el tramo.
  const qtyAlreadyInCartForRef = items.reduce(
    (s, i) => (i.code === p.code && i.id !== editing?.id ? s + i.qty : s), 0,
  );
  const basePrice = variant ? basePriceForVariant(variant.tiers, qtyAlreadyInCartForRef + qty) : p.price;
  const unitPrice = basePrice + surcharge;
  const totalPrice = unitPrice * qty;

  const texts = elements.filter((el) => el.kind === "text" && el.text).map((el) => el.text);
  const hasImage = elements.some((el) => el.kind === "image");
  const summary = `${t("summary_size")} ${size} · ${color.name}${texts.length ? ` · ${t("summary_text")}: "${texts.join(", ")}"` : ""}${hasImage ? ` · ${t("logo_label")}` : ""}`;

  const onAdd = () => {
    const payload = {
      code: p.code, name: p.name, image: color.image, size,
      colorName: color.name, colorHex: color.hex, qty,
      tiers: variant?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
      elements,
    };
    if (isEdit && editing) {
      update(editing.id, payload);
      toast.success("Updated", { description: summary });
      nav({ to: "/product/$code", params: { code: p.code }, search: {}, replace: true });
      setTimeout(() => setOpen(true), 300);
    } else {
      add(payload);
      toast.success(t("added"), { description: summary });
      setTimeout(() => setOpen(true), 400);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6">
      <button
        onClick={() => nav({ to: "/shop" })}
        className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("back_to_shop")}
      </button>

      {isEdit && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-muted px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" /> Editing cart item
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="h-[70vh] min-h-[420px] md:sticky md:top-20 md:h-[calc(100vh-8rem)]">
          <Viewer
            productCode={p.code}
            color={color} view={view} setView={setView}
            elements={elements}
            selectedId={selectedId} setSelectedId={setSelectedId}
            updateElement={updateElement} removeElement={removeElement}
          />
        </div>

        <ControlPanel
          product={p}
          size={size} setSize={setSize}
          color={color} setColor={setColor}
          qty={qty} setQty={setQty}
          elements={elements}
          selectedId={selectedId} setSelectedId={setSelectedId}
          addImage={addImage} addText={addText}
          updateElement={updateElement} removeElement={removeElement}
          totalPrice={totalPrice}
        />
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.name}</p>
            <p className="truncate text-sm font-medium">{summary}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-right">{t("cart_total")}</p>
            <p className="text-lg font-semibold">€{totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={onAdd}
            className="holo-gradient shrink-0 rounded-full px-5 py-3 font-display text-xs uppercase tracking-widest text-white shadow-[var(--gradient-holo-glow)] transition active:scale-95 sm:px-8 sm:text-sm"
          >
            {isEdit ? "Update" : t("add_to_cart")} · €{totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Prevent tree-shaking of products import for HMR
void products;
