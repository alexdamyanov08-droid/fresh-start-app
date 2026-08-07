import { useRef, useState } from "react";
import { Minus, Plus, Upload, X, Type, ImagePlus, Percent, Users } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Product, ColorVariant } from "@/data/products";
import type { DesignElement } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";

export function ControlPanel(props: {
  product: Product;
  isEdit: boolean;
  size: string; setSize: (s: string) => void;
  color: ColorVariant; setColor: (c: ColorVariant) => void;
  qty: number; setQty: (n: number) => void;
  quantities: Record<string, number>;
  setQuantity: (size: string, qty: number) => void;
  roster: { id: string; name: string; number: string; size: string }[];
  addRosterEntry: (name: string, number: string, size: string) => void;
  removeRosterEntry: (id: string) => void;
  breakdown: { label: string; qty: number; unit: number; subtotal: number }[];
  priceGroups: { label: string; tiers: { t1_10: number; t11_30: number; t31_100: number; t101_plus: number } }[];
  elements: DesignElement[];
  selectedId: string | null; setSelectedId: (id: string | null) => void;
  addImage: (dataUrl: string) => void;
  addText: () => void;
  updateElement: (id: string, patch: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  totalPrice: number;
}) {
  const { t, tr } = useI18n();
  const p = props.product;
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPriceTable, setShowPriceTable] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [rosterName, setRosterName] = useState("");
  const [rosterNumber, setRosterNumber] = useState("");
  const [rosterSize, setRosterSize] = useState(p.sizes[0] ?? "");

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\/(png|jpe?g|svg\+xml|webp)$/.test(f.type)) {
      toast.error("PNG, JPG, WEBP or SVG only");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Max 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => props.addImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const textColors = ["#0a0a0a", "#ffffff", "#8b00ff", "#00a3ff", "#ec4899", "#facc15"];
  const fonts = [
    { key: "brutal", label: "Brutal", cls: "font-display", family: "var(--font-display)" },
    { key: "sans", label: "Moderna", cls: "font-sans", family: "var(--font-sans)" },
    { key: "mono", label: "Mono", cls: "font-mono", family: "var(--font-mono)" },
    { key: "serif", label: "Elegante", cls: "font-serif", family: "var(--font-serif)" },
    { key: "script", label: "Manuscrita", cls: "font-script", family: "var(--font-script)" },
    { key: "condensed", label: "Deportiva", cls: "font-condensed", family: "var(--font-condensed)" },
    { key: "varsity", label: "Universitaria", cls: "font-varsity", family: "var(--font-varsity)" },
    { key: "graffiti", label: "Graffiti", cls: "font-graffiti", family: "var(--font-graffiti)" },
    { key: "stencil", label: "Plantilla", cls: "font-stencil", family: "var(--font-stencil)" },
    { key: "calligraphy", label: "Caligrafía", cls: "font-calligraphy", family: "var(--font-calligraphy)" },
    { key: "serif_thin", label: "Serif Fina", cls: "font-serif-thin", family: "var(--font-serif-thin)" },
    { key: "casual", label: "Casual", cls: "font-casual", family: "var(--font-casual)" },
    { key: "fun", label: "Divertida", cls: "font-fun", family: "var(--font-fun)" },
    { key: "futuristic", label: "Futurista", cls: "font-futuristic", family: "var(--font-futuristic)" },
    { key: "retro", label: "Retro", cls: "font-retro", family: "var(--font-retro)" },
    { key: "gothic", label: "Gótica", cls: "font-gothic", family: "var(--font-gothic)" },
    { key: "horror", label: "Terror", cls: "font-horror", family: "var(--font-horror)" },
    { key: "comic", label: "Cómic", cls: "font-comic", family: "var(--font-comic)" },
    { key: "cartoon", label: "Cartoon", cls: "font-cartoon", family: "var(--font-cartoon)" },
    { key: "western", label: "Western", cls: "font-western", family: "var(--font-western)" },
    { key: "neon", label: "Neón", cls: "font-neon", family: "var(--font-neon)" },
    { key: "wedding", label: "Boda", cls: "font-wedding", family: "var(--font-wedding)" },
    { key: "military", label: "Militar", cls: "font-military", family: "var(--font-military)" },
    { key: "kids", label: "Infantil", cls: "font-kids", family: "var(--font-kids)" },
    { key: "vintage", label: "Vintage", cls: "font-vintage", family: "var(--font-vintage)" },
    { key: "sketch", label: "Boceto", cls: "font-sketch", family: "var(--font-sketch)" },
    { key: "typewriter", label: "Máquina Escribir", cls: "font-typewriter", family: "var(--font-typewriter)" },
    { key: "luxury", label: "Lujo", cls: "font-luxury", family: "var(--font-luxury)" },
    { key: "street", label: "Callejera", cls: "font-street", family: "var(--font-street)" },
    { key: "blood", label: "Sangre", cls: "font-blood", family: "var(--font-blood)" },
    { key: "pixel", label: "Pixel", cls: "font-pixel", family: "var(--font-pixel)" },
    { key: "chalk", label: "Tiza", cls: "font-chalk", family: "var(--font-chalk)" },
    { key: "brush", label: "Pincel", cls: "font-brush", family: "var(--font-brush)" },
    { key: "rugby", label: "Rugby", cls: "font-rugby", family: "var(--font-rugby)" },
    { key: "refined", label: "Refinada", cls: "font-refined", family: "var(--font-refined)" },
    { key: "note", label: "Nota", cls: "font-note", family: "var(--font-note)" },
    { key: "circus", label: "Circo", cls: "font-circus", family: "var(--font-circus)" },
    { key: "spooky", label: "Espeluznante", cls: "font-spooky", family: "var(--font-spooky)" },
    { key: "metal", label: "Metal", cls: "font-metal", family: "var(--font-metal)" },
    { key: "artdeco", label: "Art Decó", cls: "font-artdeco", family: "var(--font-artdeco)" },
    { key: "techno", label: "Tecno", cls: "font-techno", family: "var(--font-techno)" },
    { key: "candy", label: "Caramelo", cls: "font-candy", family: "var(--font-candy)" },
    { key: "formal", label: "Clásica", cls: "font-formal", family: "var(--font-formal)" },
    { key: "surf", label: "Tropical", cls: "font-surf", family: "var(--font-surf)" },
    { key: "royal", label: "Real", cls: "font-royal", family: "var(--font-royal)" },
  ];

  const images = props.elements.filter((el) => el.kind === "image");
  const texts = props.elements.filter((el) => el.kind === "text");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr(p.family)} · {tr(p.gender)}</p>
        <h1
          translate="no"
          className="notranslate mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl"
        >
          {p.name}
        </h1>
        <p className="mt-2 text-2xl font-semibold">€{props.totalPrice.toFixed(2)}</p>
        {p.desc && <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>}
        {p.composition && <p className="mt-1 text-sm text-muted-foreground">{p.composition}</p>}
      </div>

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest">
          {t("color")} <span className="ml-2 font-normal normal-case text-muted-foreground">{props.color.name}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {p.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => props.setColor(c)}
              aria-label={c.name}
              aria-pressed={props.color.name === c.name}
              className={`grid h-10 w-10 place-items-center rounded-full border-2 transition ${
                props.color.name === c.name ? "border-foreground scale-110" : "border-border hover:border-foreground"
              }`}
            >
              <span className="h-7 w-7 rounded-full" style={{ backgroundColor: c.hex }} />
            </button>
          ))}
        </div>
      </section>

      {props.isEdit ? (
        <>
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest">{t("size")}</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => props.setSize(s)}
                  aria-pressed={props.size === s}
                  translate="no"
                  className={`notranslate min-w-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    props.size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest">{t("quantity")}</p>
            <div className="inline-flex items-center gap-0 rounded-full border border-border">
              <button
                onClick={() => props.setQty(Math.max(1, props.qty - 1))}
                disabled={props.qty <= 1}
                aria-label={t("dec_qty")}
                className="grid h-11 w-11 place-items-center rounded-l-full transition hover:bg-muted disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={props.qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  props.setQty(Number.isNaN(v) || v < 1 ? 1 : v);
                }}
                onFocus={(e) => e.target.select()}
                aria-label={t("quantity")}
                className="w-16 border-none bg-transparent text-center font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => props.setQty(props.qty + 1)}
                aria-label={t("inc_qty")}
                className="grid h-11 w-11 place-items-center rounded-r-full transition hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>
        </>
      ) : (
        <>
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest">{t("size")}</p>
            <div className="flex flex-col gap-2">
              {p.sizes.map((s) => {
                const qty = props.quantities[s] ?? 0;
                return (
                  <div
                    key={s}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 transition ${
                      qty > 0 ? "border-foreground" : "border-border"
                    }`}
                  >
                    <span translate="no" className="notranslate text-sm font-medium">{s}</span>
                    <div className="inline-flex items-center gap-0 rounded-full border border-border">
                      <button
                        onClick={() => props.setQuantity(s, Math.max(0, qty - 1))}
                        disabled={qty <= 0}
                        aria-label={t("dec_qty")}
                        className="grid h-9 w-9 place-items-center rounded-l-full transition hover:bg-muted disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={qty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          props.setQuantity(s, Number.isNaN(v) || v < 0 ? 0 : v);
                        }}
                        onFocus={(e) => e.target.select()}
                        aria-label={`${t("quantity")} ${s}`}
                        className="w-10 border-none bg-transparent text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => props.setQuantity(s, qty + 1)}
                        aria-label={t("inc_qty")}
                        className="grid h-9 w-9 place-items-center rounded-r-full transition hover:bg-muted"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </>
      )}

      {props.priceGroups.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowPriceTable((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-brand/30 bg-sand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand transition hover:bg-sand/70"
          >
            <Percent className="h-3.5 w-3.5 text-gold" />
            Ver precios por cantidad
            <span className={`inline-block transition-transform ${showPriceTable ? "rotate-180" : ""}`}>▾</span>
          </button>
          {showPriceTable && (
            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Tallas</th>
                    <th className="px-3 py-2 text-right font-medium">1&ndash;10</th>
                    <th className="px-3 py-2 text-right font-medium">11&ndash;30</th>
                    <th className="px-3 py-2 text-right font-medium">31&ndash;100</th>
                    <th className="px-3 py-2 text-right font-medium">101+</th>
                  </tr>
                </thead>
                <tbody>
                  {props.priceGroups.map((g) => (
                    <tr key={g.label} className="border-b border-border last:border-0">
                      <td translate="no" className="notranslate px-3 py-2 font-medium">{g.label}</td>
                      <td className="px-3 py-2 text-right">€{g.tiers.t1_10.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">€{g.tiers.t11_30.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">€{g.tiers.t31_100.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">€{g.tiers.t101_plus.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                Precios para el color <span translate="no" className="notranslate font-medium">{props.color.name}</span>. En algunos artículos el color cambia el precio: cambia de color para ver el resto.
              </p>
            </div>
          )}
        </section>
      )}

      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full">
          <TabsTrigger value="logo" className="rounded-full text-xs uppercase tracking-widest">{t("tab_logo")}</TabsTrigger>
          <TabsTrigger value="text" className="rounded-full text-xs uppercase tracking-widest">{t("tab_text")}</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="mt-4 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={onPickFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-gold bg-brand px-4 py-3 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition hover:opacity-90"
          >
            <ImagePlus className="h-4 w-4 text-gold" /> {t("upload_logo")}
          </button>
          <p className="text-[11px] text-muted-foreground">{t("image_hint")}</p>

          {images.map((el) => (
            <div
              key={el.id}
              onClick={() => props.setSelectedId(el.id)}
              className={`space-y-3 rounded-lg border p-3 transition ${
                props.selectedId === el.id ? "border-foreground" : "border-dashed border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                {el.image && (
                  <img src={el.image} alt="" className="h-14 w-14 rounded-md border border-border object-contain bg-white" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); props.removeElement(el.id); }}
                  className="ml-auto flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3" /> {t("remove_element")}
                </button>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">
                  <span>{t("logo_size")}</span>
                  <span className="font-semibold">{el.size} px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={el.size}
                  onChange={(e) => props.updateElement(el.id, { size: Number(e.target.value) })}
                  className="w-full accent-foreground"
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Precio por logo: 0–20 px 1 € · 21–30 px 1,50 € · 31–40 px 2 € · 41–50 px 2,50 € · 51–60 px 3 €
          </p>
        </TabsContent>

        <TabsContent value="text" className="mt-4 space-y-3">
          <button
            onClick={() => props.addText()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
          >
            <Type className="h-4 w-4" /> {t("add_text")}
          </button>

          {texts.map((el) => (
            <div
              key={el.id}
              onClick={() => props.setSelectedId(el.id)}
              className={`space-y-4 rounded-lg border p-3 transition ${
                props.selectedId === el.id ? "border-foreground" : "border-dashed border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={15}
                  value={el.text ?? ""}
                  onChange={(e) => props.updateElement(el.id, { text: e.target.value.toUpperCase() })}
                  placeholder={t("text_placeholder")}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 font-display uppercase tracking-widest outline-none transition focus:border-foreground"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); props.removeElement(el.id); }}
                  className="shrink-0 rounded-md border border-border p-3 text-muted-foreground transition hover:border-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-widest">{t("text_font")}</p>
                <select
                  value={el.font ?? "brutal"}
                  onChange={(e) => props.updateElement(el.id, { font: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base"
                >
                  {fonts.map((f) => (
                    <option key={f.key} value={f.key} style={{ fontFamily: f.family }}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { bold: !el.bold }); }}
                    aria-pressed={!!el.bold}
                    className={`flex-1 rounded-lg border py-2 text-sm font-black transition ${
                      el.bold ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { italic: !el.italic }); }}
                    aria-pressed={!!el.italic}
                    className={`flex-1 rounded-lg border py-2 text-sm italic transition ${
                      el.italic ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                    }`}
                  >
                    I
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-widest">{t("text_color")}</p>
                <div className="flex flex-wrap gap-2">
                  {textColors.map((c) => (
                    <button
                      key={c}
                      onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { color: c }); }}
                      aria-label={c}
                      aria-pressed={el.color === c}
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${
                        el.color === c ? "border-foreground scale-110" : "border-border"
                      }`}
                    >
                      <span className="h-6 w-6 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                    </button>
                  ))}
                  <label
                    className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-border cursor-pointer transition hover:border-foreground"
                    title="Elegir cualquier color"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="color"
                      value={el.color ?? "#0a0a0a"}
                      onChange={(e) => props.updateElement(el.id, { color: e.target.value })}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                      className="h-6 w-6 rounded-full border border-border/50"
                      style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">
                  <span>{t("text_size")}</span>
                  <span className="font-semibold">{el.size} px</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={1}
                  value={el.size}
                  onChange={(e) => props.updateElement(el.id, { size: Number(e.target.value) })}
                  className="w-full accent-foreground"
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Precio por texto: 0–20 px 1 € · 21–30 px 1,50 € · 31–40 px 2 € · 41–50 px 2,50 € · 51–60 px 3 €
          </p>
        </TabsContent>
      </Tabs>

      {!props.isEdit && (
        <section>
          <button
            type="button"
            onClick={() => setShowRoster((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-brand/30 bg-sand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand transition hover:bg-sand/70"
          >
            <Users className="h-3.5 w-3.5 text-gold" />
            ¿Cada prenda lleva un nombre? Indícalo aquí
            <span className={`inline-block transition-transform ${showRoster ? "rotate-180" : ""}`}>▾</span>
          </button>
          {showRoster && (
            <div className="mt-3 space-y-3 rounded-lg border border-border p-3">
              <p className="text-[11px] text-muted-foreground">
                Añade cada amigo con su talla. Si has diseñado un texto arriba, se sustituirá por el nombre (y número) de cada persona en su prenda.
              </p>
              <div className="grid grid-cols-[1fr_56px_130px_auto] gap-2">
                <input
                  type="text"
                  value={rosterName}
                  onChange={(e) => setRosterName(e.target.value)}
                  placeholder="Nombre"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground"
                />
                <input
                  type="text"
                  value={rosterNumber}
                  onChange={(e) => setRosterNumber(e.target.value)}
                  placeholder="Nº"
                  maxLength={3}
                  className="rounded-md border border-border bg-background px-2 py-2 text-sm outline-none transition focus:border-foreground"
                />
                <select
                  value={rosterSize}
                  onChange={(e) => setRosterSize(e.target.value)}
                  translate="no"
                  className="notranslate rounded-md border border-border bg-background px-2 py-2 text-sm outline-none transition focus:border-foreground"
                >
                  {p.sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!rosterName.trim()) return;
                    props.addRosterEntry(rosterName, rosterNumber, rosterSize || p.sizes[0]);
                    setRosterName("");
                    setRosterNumber("");
                  }}
                  className="rounded-md bg-brand px-3 py-2 text-xs font-bold uppercase text-brand-foreground transition hover:opacity-90"
                >
                  Añadir
                </button>
              </div>

              {props.roster.length > 0 && (
                <div className="space-y-1.5">
                  {props.roster.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span translate="no" className="notranslate">
                        {r.name}
                        {r.number ? ` · ${r.number}` : ""} <span className="text-muted-foreground">— {r.size}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => props.removeRosterEntry(r.id)}
                        aria-label="Quitar"
                        className="text-muted-foreground transition hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {!props.isEdit && props.breakdown.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Resumen del pedido</p>
          <div className="space-y-1.5 rounded-xl border border-foreground/10 bg-foreground p-4 text-sm text-background">
            {props.breakdown.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <span translate="no" className="notranslate">
                  {b.label} × {b.qty}
                </span>
                <span className="text-background/70">
                  €{b.unit.toFixed(2)} /ud · <span className="font-semibold text-background">€{b.subtotal.toFixed(2)}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}