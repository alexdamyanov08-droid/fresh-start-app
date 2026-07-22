import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products } from "@/data/products";
import { Viewer, type View } from "@/components/customizer/Viewer";
import { ControlPanel } from "@/components/customizer/ControlPanel";
import { useCart } from "@/lib/cart-store";
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
  const [logoPos, setLogoPos] = useState<string | null>(editing?.logoPlacement ?? null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  const [customText, setCustomText] = useState(editing?.customText ?? "");
  const [textFont, setTextFont] = useState(editing?.textFont ?? "brutal");
  const [textColor, setTextColor] = useState(editing?.textColor ?? "#0a0a0a");
  const [textSize, setTextSize] = useState(24);
  const [overlayPos, setOverlayPos] = useState({ x: 0, y: -10 });
  const [editMode, setEditMode] = useState(false);

  // If ?edit points to an item that no longer exists, drop the param
  useEffect(() => {
    if (edit && !editing) nav({ to: "/product/$code", params: { code: p.code }, search: {}, replace: true });
  }, [edit, editing, nav, p.code]);

  const imageSurcharge = useMemo(
    () => (logoImage ? Math.round(6 + logoSize * 0.5) : 0),
    [logoImage, logoSize],
  );

  const textSurcharge = useMemo(
    () => (customText ? Math.round(4 + customText.length * 0.4 + textSize * 0.2) : 0),
    [customText, textSize],
  );

  const unitPrice = useMemo(() => {
    let x = p.price;
    if (logoPos) x += 8;
    x += textSurcharge;
    x += imageSurcharge;
    return x;
  }, [p.price, logoPos, textSurcharge, imageSurcharge]);
  const totalPrice = unitPrice * qty;

  const summary = `${t("summary_size")} ${size} · ${color.name}${customText ? ` · ${t("summary_text")}: "${customText}"` : ""}${logoPos ? ` · ${t("logo_label")}` : ""}${logoImage ? ` · ${t("custom_image")} (${logoSize}%)` : ""}`;

  const onAdd = () => {
    const payload = {
      code: p.code, name: p.name, image: color.image, size,
      colorName: color.name, colorHex: color.hex, qty, unitPrice,
      logoPlacement: logoPos, customText: customText || null,
      textFont: customText ? textFont : null, textColor: customText ? textColor : null,
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
            color={color} view={view} setView={setView}
            logoPos={logoPos} logoImage={logoImage} logoSize={logoSize}
            customText={customText}
            textColor={textColor} textFont={textFont} textSize={textSize}
            overlayPos={overlayPos} setOverlayPos={setOverlayPos}
            editMode={editMode} setEditMode={setEditMode}
          />
        </div>

        <ControlPanel
          product={p}
          size={size} setSize={setSize}
          color={color} setColor={setColor}
          qty={qty} setQty={setQty}
          logoPos={logoPos} setLogoPos={setLogoPos}
          logoImage={logoImage} setLogoImage={setLogoImage}
          logoSize={logoSize} setLogoSize={setLogoSize}
          customText={customText} setCustomText={setCustomText}
          textFont={textFont} setTextFont={setTextFont}
          textColor={textColor} setTextColor={setTextColor}
          textSize={textSize} setTextSize={setTextSize}
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
