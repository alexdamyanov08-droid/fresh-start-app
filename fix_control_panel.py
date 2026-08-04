"""
Arreglo para el paso anterior: tu ControlPanel.tsx tiene una estructura algo
distinta a la que yo suponía (ya incluye el sistema de varios logos/textos y
la composición), así que el script de la vez pasada no pudo encontrar el
texto exacto que buscaba en ese archivo. Este script está adaptado a tu
versión real.

Es seguro volver a ejecutarlo aunque ya hayas corrido el anterior: si algo ya
está aplicado, lo detecta y no lo vuelve a tocar. Solo actualiza ControlPanel.tsx.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto (junto a package.json).
2. En la terminal:
       python3 fix_control_panel.py
3. Revisa el mensaje. Si dice "Actualizado", relanza npm run dev y prueba
   la ficha de un artículo: los colores deberían salir antes que las tallas,
   y (si NO estás editando una línea del carrito) cada talla debería tener
   su propio contador de cantidad.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

PANEL_PROPS_OLD = '''export function ControlPanel(props: {
  product: Product;
  size: string; setSize: (s: string) => void;
  color: ColorVariant; setColor: (c: ColorVariant) => void;
  qty: number; setQty: (n: number) => void;
  elements: DesignElement[];
  selectedId: string | null; setSelectedId: (id: string | null) => void;
  addImage: (dataUrl: string) => void;
  addText: () => void;
  updateElement: (id: string, patch: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  totalPrice: number;
}) {'''

PANEL_PROPS_NEW = '''export function ControlPanel(props: {
  product: Product;
  isEdit: boolean;
  size: string; setSize: (s: string) => void;
  color: ColorVariant; setColor: (c: ColorVariant) => void;
  qty: number; setQty: (n: number) => void;
  quantities: Record<string, number>;
  setQuantity: (size: string, qty: number) => void;
  elements: DesignElement[];
  selectedId: string | null; setSelectedId: (id: string | null) => void;
  addImage: (dataUrl: string) => void;
  addText: () => void;
  updateElement: (id: string, patch: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  totalPrice: number;
}) {'''

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


def fail(msg: str) -> None:
    print(f"\n❌ {msg}\n")


def patch_file(path: Path, replacements: list) -> bool:
    if not path.exists():
        fail(f"No encuentro {path}. ¿Está el script en la raíz del proyecto?")
        return False
    content = path.read_text(encoding="utf-8")
    original = content
    for old, new in replacements:
        if old not in content:
            if new in content:
                print(f"ℹ️  Ya tenía este cambio aplicado en {path.relative_to(ROOT)}, no toco nada.")
                continue
            fail(
                f"No encuentro el texto esperado en {path.relative_to(ROOT)}. "
                f"No se ha cambiado nada de este archivo; copia y pégame de nuevo "
                f"el contenido completo (cat {path.relative_to(ROOT)}) para ajustarlo."
            )
            return False
        content = content.replace(old, new, 1)
    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"✅ Actualizado {path.relative_to(ROOT)}")
    else:
        print(f"ℹ️  {path.relative_to(ROOT)} ya estaba al día, no ha hecho falta cambiar nada.")
    return True


def main() -> None:
    ok = patch_file(PANEL_FILE, [(PANEL_PROPS_OLD, PANEL_PROPS_NEW), (PANEL_BODY_OLD, PANEL_BODY_NEW)])
    if ok:
        print("\nListo. Reinicia el servidor (npm run dev) y prueba la ficha de un artículo.")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
