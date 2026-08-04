"""
Aplica 3 mejoras a la web Xprint Wear (repo fresh-start-app):

1. Ordena las tallas de forma lógica (S, M, L, XL... o 3, 6, 9, 12 MESES...)
   en vez del orden aleatorio que venía del Excel.
2. Evita que el traductor de Google (el botón ES/EN de arriba) estropee las
   tallas y las convierta en palabras sin sentido (el bug de "DESASTRES").
3. Cambia el orden de la ficha de artículo: primero el color, luego la lista
   de tallas, y cada talla con su propio campo de cantidad, para poder añadir
   varias tallas al carrito de una sola vez.

CÓMO USARLO (dentro de tu Codespace):
1. Sube este archivo a la raíz del proyecto (donde está package.json), junto
   a los demás scripts que ya tengas ahí.
2. En la terminal escribe:
       python3 add_sizes_and_colors_first.py
3. Revisa los mensajes: te dirá qué archivos ha tocado, o si algo no ha
   podido aplicarse (en ese caso no habrá tocado nada de ese archivo).
4. Relanza `npm run dev` y prueba la ficha de un artículo con muchas tallas
   (por ejemplo un chubasquero o una chaqueta).
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SIZES_FILE = ROOT / "src" / "lib" / "sizes.ts"
PRODUCTS_FILE = ROOT / "src" / "data" / "products.ts"
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"
PAGE_FILE = ROOT / "src" / "routes" / "product.$code.tsx"

SIZES_TS = '''// Orden lógico de tallas para mostrarlas en la web (en vez del orden aleatorio del Excel).
const LETTER_ORDER = [
  "3XS", "2XS", "XXS", "XS", "S", "M", "L", "XL",
  "XXL", "2XL", "3XL", "XXXL", "4XL", "5XL", "6XL",
];

function letterIndex(token: string): number {
  const i = LETTER_ORDER.indexOf(token);
  return i === -1 ? 999 : i;
}

function sizeSortKey(raw: string): [number, number, string] {
  const s = raw.trim().toUpperCase();

  if (LETTER_ORDER.includes(s)) return [0, letterIndex(s), s];

  // meses / años (tallas de bebé), p.ej. "6 MESES", "2 AÑOS"
  let m = s.match(/^(\\d+)\\s*MESES?$/);
  if (m) return [1, parseInt(m[1], 10), s];
  m = s.match(/^(\\d+)\\s*A[ÑN]OS?$/);
  if (m) return [1, parseInt(m[1], 10) * 12, s];

  // rangos tipo "3/4", "9/10" (tallas infantiles)
  m = s.match(/^(\\d+)\\/(\\d+)$/);
  if (m) return [2, parseInt(m[1], 10), s];

  // tallas numéricas puras (edades, pantalón, vaquero...)
  m = s.match(/^(\\d+)$/);
  if (m) return [3, parseInt(m[1], 10), s];

  // rangos combinados tipo "XS-S", "M-L", "XL-2XL"
  m = s.match(/^([A-Z0-9]+)-([A-Z0-9]+)$/);
  if (m) return [0, letterIndex(m[1]), s];

  // tallas de calzado/agrupadas "KID (31/34)", "JR (35/40)", "SR (41-46)"
  const group: Record<string, number> = { KID: 0, JR: 1, SR: 2 };
  const gKey = Object.keys(group).find((k) => s.startsWith(k));
  if (gKey) return [4, group[gKey], s];

  return [5, 0, s];
}

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ka = sizeSortKey(a);
    const kb = sizeSortKey(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] - kb[1];
    return ka[2].localeCompare(kb[2]);
  });
}
'''

PRODUCTS_OLD = 'export const getProduct = (code: string) => products.find(p => p.code === code);'
PRODUCTS_NEW = '''import { sortSizes } from "@/lib/sizes";

export const getProduct = (code: string) => {
  const p = products.find(p => p.code === code);
  if (!p) return p;
  return { ...p, sizes: sortSizes(p.sizes) };
};'''

PANEL_PROPS_OLD = '''export function ControlPanel(props: {
  product: Product;
  size: string; setSize: (s: string) => void;
  color: ColorVariant; setColor: (c: ColorVariant) => void;
  qty: number; setQty: (n: number) => void;
  logoPos: string | null; setLogoPos: (v: string | null) => void;'''
PANEL_PROPS_NEW = '''export function ControlPanel(props: {
  product: Product;
  isEdit: boolean;
  size: string; setSize: (s: string) => void;
  color: ColorVariant; setColor: (c: ColorVariant) => void;
  qty: number; setQty: (n: number) => void;
  quantities: Record<string, number>;
  setQuantity: (size: string, qty: number) => void;
  logoPos: string | null; setLogoPos: (v: string | null) => void;'''

PANEL_BODY_OLD = '''      <section>
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
      </section>'''

PANEL_BODY_NEW = '''      <section>
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
        </>
      ) : (
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
                    <span className="w-8 text-center text-sm font-semibold">{qty}</span>
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
      )}'''

PAGE_STATE_OLD = '''  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [view, setView] = useState<View>("front");'''
PAGE_STATE_NEW = '''  const [qty, setQty] = useState(editing?.qty ?? 1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const setQuantity = (s: string, n: number) => setQuantities((prev) => ({ ...prev, [s]: n }));
  const [view, setView] = useState<View>("front");'''

PAGE_PRICE_OLD = '''  const basePrice = variant ? basePriceForVariant(variant.tiers, qtyAlreadyInCartForRef + qty) : p.price;
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
  };'''
PAGE_PRICE_NEW = '''  const basePrice = variant ? basePriceForVariant(variant.tiers, qtyAlreadyInCartForRef + qty) : p.price;
  const unitPrice = basePrice + surcharge;

  // Suma de unidades elegidas entre todas las tallas (solo aplica cuando NO se está editando una línea).
  const totalQtyAllSizes = Object.values(quantities).reduce((s, n) => s + (n || 0), 0);
  const totalPriceAllSizes = Object.entries(quantities).reduce((sum, [sz, n]) => {
    if (!n) return sum;
    const v = getVariant(p, sz, color.name);
    const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
    return sum + (bp + surcharge) * n;
  }, 0);

  const totalPrice = isEdit ? unitPrice * qty : totalPriceAllSizes;

  const texts = elements.filter((el) => el.kind === "text" && el.text).map((el) => el.text);
  const hasImage = elements.some((el) => el.kind === "image");
  const chosenSizesLabel = Object.entries(quantities)
    .filter(([, n]) => n > 0)
    .map(([sz, n]) => `${sz} ×${n}`)
    .join(", ");
  const summary = isEdit
    ? `${t("summary_size")} ${size} · ${color.name}${texts.length ? ` · ${t("summary_text")}: "${texts.join(", ")}"` : ""}${hasImage ? ` · ${t("logo_label")}` : ""}`
    : `${color.name}${chosenSizesLabel ? ` · ${chosenSizesLabel}` : ""}`;

  const onAdd = () => {
    if (isEdit && editing) {
      const payload = {
        code: p.code, name: p.name, image: color.image, size,
        colorName: color.name, colorHex: color.hex, qty,
        tiers: variant?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
        elements,
      };
      update(editing.id, payload);
      toast.success("Updated", { description: summary });
      nav({ to: "/product/$code", params: { code: p.code }, search: {}, replace: true });
      setTimeout(() => setOpen(true), 300);
      return;
    }

    const entries = Object.entries(quantities).filter(([, n]) => n > 0);
    if (entries.length === 0) return;
    for (const [sz, n] of entries) {
      const v = getVariant(p, sz, color.name);
      add({
        code: p.code, name: p.name, image: color.image, size: sz,
        colorName: color.name, colorHex: color.hex, qty: n,
        tiers: v?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
        elements,
      });
    }
    toast.success(t("added"), { description: summary });
    setQuantities({});
    setTimeout(() => setOpen(true), 400);
  };'''

PAGE_CONTROLPANEL_OLD = '''        <ControlPanel
          product={p}
          size={size} setSize={setSize}
          color={color} setColor={setColor}
          qty={qty} setQty={setQty}
          elements={elements}'''
PAGE_CONTROLPANEL_NEW = '''        <ControlPanel
          product={p}
          isEdit={isEdit}
          size={size} setSize={setSize}
          color={color} setColor={setColor}
          qty={qty} setQty={setQty}
          quantities={quantities} setQuantity={setQuantity}
          elements={elements}'''

PAGE_BUTTON_OLD = '''          <button
            onClick={onAdd}
            className="holo-gradient shrink-0 rounded-full px-5 py-3 font-display text-xs uppercase tracking-widest text-white shadow-[var(--gradient-holo-glow)] transition active:scale-95 sm:px-8 sm:text-sm"
          >
            {isEdit ? "Update" : t("add_to_cart")} · €{totalPrice.toFixed(2)}
          </button>'''
PAGE_BUTTON_NEW = '''          <button
            onClick={onAdd}
            disabled={!isEdit && totalQtyAllSizes === 0}
            className="holo-gradient shrink-0 rounded-full px-5 py-3 font-display text-xs uppercase tracking-widest text-white shadow-[var(--gradient-holo-glow)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-8 sm:text-sm"
          >
            {isEdit ? "Update" : t("add_to_cart")} · €{totalPrice.toFixed(2)}
          </button>'''


def fail(msg: str) -> None:
    print(f"\n❌ {msg}\n")


def patch_file(path: Path, replacements: list, label: str) -> bool:
    if not path.exists():
        fail(f"No encuentro {path}. ¿Está el script en la raíz del proyecto?")
        return False
    content = path.read_text(encoding="utf-8")
    original = content
    for old, new in replacements:
        if old not in content:
            if new in content:
                print(f"ℹ️  {label}: parece que ya tenía este cambio aplicado, no toco nada.")
                continue
            fail(
                f"No encuentro el texto esperado en {path.relative_to(ROOT)}. "
                f"Puede que el archivo se haya modificado desde la última vez. "
                f"No se ha cambiado este archivo; avisa para revisarlo."
            )
            return False
        content = content.replace(old, new, 1)
    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"✅ Actualizado {path.relative_to(ROOT)}")
    return True


def main() -> None:
    ok = True

    if not SIZES_FILE.exists():
        SIZES_FILE.parent.mkdir(parents=True, exist_ok=True)
        SIZES_FILE.write_text(SIZES_TS, encoding="utf-8")
        print(f"✅ Creado {SIZES_FILE.relative_to(ROOT)}")
    else:
        print(f"ℹ️  {SIZES_FILE.relative_to(ROOT)} ya existe, no lo toco.")

    ok &= patch_file(PRODUCTS_FILE, [(PRODUCTS_OLD, PRODUCTS_NEW)], "products.ts")
    ok &= patch_file(
        PANEL_FILE,
        [(PANEL_PROPS_OLD, PANEL_PROPS_NEW), (PANEL_BODY_OLD, PANEL_BODY_NEW)],
        "ControlPanel.tsx",
    )
    ok &= patch_file(
        PAGE_FILE,
        [
            (PAGE_STATE_OLD, PAGE_STATE_NEW),
            (PAGE_PRICE_OLD, PAGE_PRICE_NEW),
            (PAGE_CONTROLPANEL_OLD, PAGE_CONTROLPANEL_NEW),
            (PAGE_BUTTON_OLD, PAGE_BUTTON_NEW),
        ],
        "product.$code.tsx",
    )

    if ok:
        print("\nListo. Ahora reinicia el servidor (npm run dev) y prueba la ficha de un artículo.")
    else:
        print("\n⚠️  Algún archivo no se ha podido actualizar del todo. Revisa los mensajes de arriba.")
        sys.exit(1)


if __name__ == "__main__":
    main()
