import { useRef } from "react";
import { Minus, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Product, ColorVariant } from "@/data/products";
import { useI18n } from "@/lib/i18n";

export function ControlPanel(props: {
  product: Product;
  size: string; setSize: (s: string) => void;
  color: ColorVariant; setColor: (c: ColorVariant) => void;
  qty: number; setQty: (n: number) => void;
  logoPos: string | null; setLogoPos: (v: string | null) => void;
  logoImage: string | null; setLogoImage: (v: string | null) => void;
  logoSize: number; setLogoSize: (n: number) => void;
  customText: string; setCustomText: (v: string) => void;
  textFont: string; setTextFont: (v: string) => void;
  textColor: string; setTextColor: (v: string) => void;
  textSize: number; setTextSize: (n: number) => void;
  totalPrice: number;
}) {
  const { t, tr } = useI18n();
  const p = props.product;
  const fileRef = useRef<HTMLInputElement>(null);

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
    reader.onload = () => {
      props.setLogoImage(String(reader.result));
      props.setLogoPos(null);
    };
    reader.readAsDataURL(f);
  };


  const textColors = ["#0a0a0a", "#ffffff", "#8b00ff", "#00a3ff", "#ec4899", "#facc15"];
  const fonts = [
    { key: "brutal", label: "BRUTAL", cls: "font-display" },
    { key: "italic", label: "Italic", cls: "font-sans font-black italic" },
    { key: "mono", label: "MONO", cls: "font-mono font-bold" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{tr(p.family)} · {tr(p.gender)}</p>
        <h1 className="mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
          {p.name} <span className="text-holo">v1.0</span>
        </h1>
        <p className="mt-2 text-2xl font-semibold">€{props.totalPrice.toFixed(2)}</p>
        {p.desc && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.desc}</p>}
      </div>

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest">{t("size")}</p>
        <div className="flex flex-wrap gap-2">
          {p.sizes.map((s) => (
            <button
              key={s}
              onClick={() => props.setSize(s)}
              aria-pressed={props.size === s}
              className={`min-w-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
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
          <span className="w-12 text-center font-semibold">{props.qty}</span>
          <button
            onClick={() => props.setQty(props.qty + 1)}
            aria-label={t("inc_qty")}
            className="grid h-11 w-11 place-items-center rounded-r-full transition hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full">
          <TabsTrigger value="logo" className="rounded-full text-xs uppercase tracking-widest">{t("tab_logo")}</TabsTrigger>
          <TabsTrigger value="text" className="rounded-full text-xs uppercase tracking-widest">{t("tab_text")}</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="mt-4 space-y-3">
          <div className="rounded-lg border border-dashed border-border p-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={onPickFile}
            />
            {!props.logoImage ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
              >
                <Upload className="h-4 w-4" /> {t("upload_logo")}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={props.logoImage} alt="" className="h-14 w-14 rounded-md border border-border object-contain bg-white" />
                  <div className="flex-1 space-y-1.5">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest transition hover:border-foreground"
                    >
                      {t("replace_logo")}
                    </button>
                    <button
                      onClick={() => props.setLogoImage(null)}
                      className="flex w-full items-center justify-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" /> {t("remove_logo")}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">
                    <span>{t("logo_size")}</span>
                    <span className="font-semibold">{props.logoSize}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={38}
                    step={1}
                    value={props.logoSize}
                    onChange={(e) => props.setLogoSize(Number(e.target.value))}
                    className="w-full accent-foreground"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{t("image_surcharge")}</p>
                </div>
              </div>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">{t("image_hint")}</p>
          </div>

        </TabsContent>

        <TabsContent value="text" className="mt-4 space-y-4">
          <div>
            <label htmlFor="ctext" className="mb-1.5 block text-xs uppercase tracking-widest">{t("tab_text")}</label>
            <input
              id="ctext"
              type="text"
              maxLength={15}
              value={props.customText}
              onChange={(e) => props.setCustomText(e.target.value.toUpperCase())}
              placeholder={t("text_placeholder")}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-display uppercase tracking-widest outline-none transition focus:border-foreground"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{props.customText.length}/15</p>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest">{t("text_font")}</p>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.key}
                  onClick={() => props.setTextFont(f.key)}
                  aria-pressed={props.textFont === f.key}
                  className={`rounded-lg border py-3 text-sm uppercase transition ${f.cls} ${
                    props.textFont === f.key ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest">{t("text_color")}</p>
            <div className="flex flex-wrap gap-2">
              {textColors.map((c) => (
                <button
                  key={c}
                  onClick={() => props.setTextColor(c)}
                  aria-label={c}
                  aria-pressed={props.textColor === c}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${
                    props.textColor === c ? "border-foreground scale-110" : "border-border"
                  }`}
                >
                  <span className="h-6 w-6 rounded-full border border-border/50" style={{ backgroundColor: c }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">
              <span>{t("text_size")}</span>
              <span className="font-semibold">{props.textSize}</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={1}
              value={props.textSize}
              onChange={(e) => props.setTextSize(Number(e.target.value))}
              className="w-full accent-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t("text_on_sleeves")}</p>
          </div>
          {props.customText && (
            <p className="text-xs text-muted-foreground">{t("text_surcharge")}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
