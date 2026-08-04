"""
Reordena la ficha de artículo según lo pedido:
  1. Colores y tallas (para añadir al carrito)
  2. Tabla desplegable de precios por cantidad (nueva)
  3. Subida de logo / texto personalizado
  4. Resumen del pedido (al final)

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 reorder_and_add_price_table.py
3. Relanza el servidor:
       pkill -f vite
       npm run dev
4. Ctrl+Shift+R en el navegador antes de probar.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAGE_FILE = ROOT / "src" / "routes" / "product.$code.tsx"
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

# --- product.$code.tsx ---------------------------------------------------

PAGE_GROUPS_OLD = '''  const variant = useMemo(() => getVariant(p, size, color.name), [p, size, color.name]);
  const surcharge = useMemo(() => surchargeOf(elements), [elements]);'''

PAGE_GROUPS_NEW = '''  const variant = useMemo(() => getVariant(p, size, color.name), [p, size, color.name]);
  const surcharge = useMemo(() => surchargeOf(elements), [elements]);

  // Agrupa las tallas que comparten exactamente los mismos precios por tramo de cantidad
  // (el color nunca cambia el precio, solo la talla), para la tabla desplegable de precios.
  const priceGroups = useMemo(() => {
    const map = new Map<string, { tiers: any; sizes: string[] }>();
    for (const s of p.sizes) {
      const v = getVariant(p, s, p.colors[0].name);
      if (!v) continue;
      const key = JSON.stringify(v.tiers);
      if (!map.has(key)) map.set(key, { tiers: v.tiers, sizes: [] });
      map.get(key)!.sizes.push(s);
    }
    return Array.from(map.values()).map((g) => ({
      label: g.sizes.length > 3 ? `${g.sizes[0]}\u2013${g.sizes[g.sizes.length - 1]}` : g.sizes.join(", "),
      tiers: g.tiers,
    }));
  }, [p]);'''

PAGE_PROP_OLD = '''          quantities={quantities} setQuantity={setQuantity}
          breakdown={breakdown}
          elements={elements}'''

PAGE_PROP_NEW = '''          quantities={quantities} setQuantity={setQuantity}
          breakdown={breakdown}
          priceGroups={priceGroups}
          elements={elements}'''

# --- ControlPanel.tsx ------------------------------------------------------

PANEL_IMPORT_OLD = 'import { useRef } from "react";'
PANEL_IMPORT_NEW = 'import { useRef, useState } from "react";'

PANEL_TYPE_OLD = '''  breakdown: { size: string; qty: number; unit: number; subtotal: number }[];
  elements: DesignElement[];'''

PANEL_TYPE_NEW = '''  breakdown: { size: string; qty: number; unit: number; subtotal: number }[];
  priceGroups: { label: string; tiers: { t1_10: number; t11_30: number; t31_100: number; t101_plus: number } }[];
  elements: DesignElement[];'''

PANEL_STATE_OLD = '''  const { t, tr } = useI18n();
  const p = props.product;
  const fileRef = useRef<HTMLInputElement>(null);'''

PANEL_STATE_NEW = '''  const { t, tr } = useI18n();
  const p = props.product;
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPriceTable, setShowPriceTable] = useState(false);'''

PANEL_ELSE_BREAKDOWN_OLD = '''          {props.breakdown.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Resumen del pedido</p>
              <div className="space-y-1.5 rounded-xl border border-foreground/10 bg-foreground p-4 text-sm text-background">
                {props.breakdown.map((b) => (
                  <div key={b.size} className="flex items-center justify-between gap-2">
                    <span translate="no" className="notranslate">
                      {b.size} × {b.qty}
                    </span>
                    <span className="text-background/70">
                      €{b.unit.toFixed(2)} /ud · <span className="font-semibold text-background">€{b.subtotal.toFixed(2)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Tabs defaultValue="logo" className="w-full">'''

PANEL_ELSE_BREAKDOWN_NEW = '''        </>
      )}

      {props.priceGroups.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowPriceTable((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            <span className={`inline-block transition-transform ${showPriceTable ? "rotate-180" : ""}`}>▾</span>
            Ver precios por cantidad
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
                El color no cambia el precio, solo la talla.
              </p>
            </div>
          )}
        </section>
      )}

      <Tabs defaultValue="logo" className="w-full">'''

PANEL_END_OLD = '''        </TabsContent>
      </Tabs>
    </div>
  );
}'''

PANEL_END_NEW = '''        </TabsContent>
      </Tabs>

      {!props.isEdit && props.breakdown.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Resumen del pedido</p>
          <div className="space-y-1.5 rounded-xl border border-foreground/10 bg-foreground p-4 text-sm text-background">
            {props.breakdown.map((b) => (
              <div key={b.size} className="flex items-center justify-between gap-2">
                <span translate="no" className="notranslate">
                  {b.size} × {b.qty}
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
}'''


def fail(msg: str) -> None:
    print(f"\n❌ {msg}\n")


def patch_file(path: Path, replacements: list, label: str) -> bool:
    if not path.exists():
        fail(f"No encuentro {path}. ¿Está el script en la raíz del proyecto?")
        return False
    content = path.read_text(encoding="utf-8")
    original = content
    for old, new in replacements:
        if new in content:
            print(f"ℹ️  {label}: ya tenía este cambio aplicado, no toco nada.")
            continue
        if old not in content:
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
        [(PAGE_GROUPS_OLD, PAGE_GROUPS_NEW), (PAGE_PROP_OLD, PAGE_PROP_NEW)],
        "product.$code.tsx",
    )
    ok &= patch_file(
        PANEL_FILE,
        [
            (PANEL_IMPORT_OLD, PANEL_IMPORT_NEW),
            (PANEL_TYPE_OLD, PANEL_TYPE_NEW),
            (PANEL_STATE_OLD, PANEL_STATE_NEW),
            (PANEL_ELSE_BREAKDOWN_OLD, PANEL_ELSE_BREAKDOWN_NEW),
            (PANEL_END_OLD, PANEL_END_NEW),
        ],
        "ControlPanel.tsx",
    )

    if ok:
        print("\nListo. Ahora ejecuta:")
        print("    pkill -f vite")
        print("    npm run dev")
        print("Y Ctrl+Shift+R en el navegador.")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
