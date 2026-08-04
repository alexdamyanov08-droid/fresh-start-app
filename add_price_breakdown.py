"""
Sustituye la línea antigua "1 × 8,10 €" (que venía de cuando solo se podía
elegir una talla) por un desglose real: cada talla elegida, su cantidad,
su precio unitario y su subtotal. Así se ve claramente que una talla de
niño no cuesta lo mismo que una 3XL.

Es seguro volver a ejecutarlo si ya lo hiciste: si detecta que ya está
aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto (junto a package.json).
2. En la terminal:
       python3 add_price_breakdown.py
3. Relanza el servidor con estos DOS comandos (importante, para descartar
   que sea un problema de caché):
       pkill -f vite
       npm run dev
4. Haz Ctrl+Shift+R (recarga forzada) en el navegador antes de probar.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAGE_FILE = ROOT / "src" / "routes" / "product.$code.tsx"
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

# --- product.$code.tsx ---------------------------------------------------

PAGE_BREAKDOWN_OLD = '''  const totalPrice = isEdit ? unitPrice * qty : totalPriceAllSizes;

  const texts = elements.filter((el) => el.kind === "text" && el.text).map((el) => el.text);'''

PAGE_BREAKDOWN_NEW = '''  const totalPrice = isEdit ? unitPrice * qty : totalPriceAllSizes;

  // Desglose detallado: talla, cantidad, precio unitario y subtotal de cada línea elegida.
  const breakdown = Object.entries(quantities)
    .filter(([, n]) => n > 0)
    .map(([sz, n]) => {
      const v = getVariant(p, sz, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      const unit = bp + surcharge;
      return { size: sz, qty: n, unit, subtotal: unit * n };
    });

  const texts = elements.filter((el) => el.kind === "text" && el.text).map((el) => el.text);'''

PAGE_CONTROLPANEL_OLD = '''        <ControlPanel
          product={p}
          isEdit={isEdit}
          size={size} setSize={setSize}
          color={color} setColor={setColor}
          qty={qty} setQty={setQty}
          quantities={quantities} setQuantity={setQuantity}
          elements={elements}'''

PAGE_CONTROLPANEL_NEW = '''        <ControlPanel
          product={p}
          isEdit={isEdit}
          size={size} setSize={setSize}
          color={color} setColor={setColor}
          qty={qty} setQty={setQty}
          quantities={quantities} setQuantity={setQuantity}
          breakdown={breakdown}
          elements={elements}'''

PAGE_STICKY_OLD = '''          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-muted-foreground">
              {qty} × €{unitPrice.toFixed(2)}
            </p>
            <p className="text-lg font-semibold">€{totalPrice.toFixed(2)}</p>
          </div>'''

PAGE_STICKY_NEW = '''          <div className="hidden sm:block text-right">
            {isEdit ? (
              <p className="text-sm font-medium text-muted-foreground">
                {qty} × €{unitPrice.toFixed(2)}
              </p>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                {totalQtyAllSizes} {totalQtyAllSizes === 1 ? "unidad" : "unidades"}
              </p>
            )}
            <p className="text-lg font-semibold">€{totalPrice.toFixed(2)}</p>
          </div>'''

# --- ControlPanel.tsx ------------------------------------------------------

PANEL_PROPS_OLD = '''  quantities: Record<string, number>;
  setQuantity: (size: string, qty: number) => void;
  elements: DesignElement[];'''

PANEL_PROPS_NEW = '''  quantities: Record<string, number>;
  setQuantity: (size: string, qty: number) => void;
  breakdown: { size: string; qty: number; unit: number; subtotal: number }[];
  elements: DesignElement[];'''

PANEL_ELSE_OLD = '''      ) : (
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
      )}'''

PANEL_ELSE_NEW = '''      ) : (
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

          {props.breakdown.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Resumen del pedido</p>
              <div className="space-y-1.5 rounded-lg border border-border p-3 text-sm">
                {props.breakdown.map((b) => (
                  <div key={b.size} className="flex items-center justify-between gap-2">
                    <span translate="no" className="notranslate">
                      {b.size} × {b.qty}
                    </span>
                    <span className="text-muted-foreground">
                      €{b.unit.toFixed(2)} /ud · <span className="font-semibold text-foreground">€{b.subtotal.toFixed(2)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}'''


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
                print(f"ℹ️  {label}: ya tenía este cambio aplicado, no toco nada.")
                continue
            fail(
                f"No encuentro el texto esperado en {path.relative_to(ROOT)}. "
                f"No se ha cambiado nada de este archivo; pégame de nuevo su contenido "
                f"completo para ajustarlo."
            )
            return False
        content = content.replace(old, new, 1)
    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"✅ Actualizado {path.relative_to(ROOT)}")
    else:
        print(f"ℹ️  {path.relative_to(ROOT)} ya estaba al día.")
    return True


def main() -> None:
    ok = True
    ok &= patch_file(
        PAGE_FILE,
        [
            (PAGE_BREAKDOWN_OLD, PAGE_BREAKDOWN_NEW),
            (PAGE_CONTROLPANEL_OLD, PAGE_CONTROLPANEL_NEW),
            (PAGE_STICKY_OLD, PAGE_STICKY_NEW),
        ],
        "product.$code.tsx",
    )
    ok &= patch_file(
        PANEL_FILE,
        [(PANEL_PROPS_OLD, PANEL_PROPS_NEW), (PANEL_ELSE_OLD, PANEL_ELSE_NEW)],
        "ControlPanel.tsx",
    )

    if ok:
        print("\nListo. Ahora ejecuta estos DOS comandos (importante, no solo uno):")
        print("    pkill -f vite")
        print("    npm run dev")
        print("Y haz Ctrl+Shift+R en el navegador antes de probar.")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
