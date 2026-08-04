"""
Añade el desplegable "Nombres y números": el cliente diseña su prenda como
siempre (color, logo y/o texto), y con este desplegable puede añadir una
lista de amigos (nombre, número opcional y talla). Al añadir al carrito, se
crea una línea por cada amigo con su talla, reutilizando el mismo diseño
pero sustituyendo el texto personalizado por el nombre (y número) de esa
persona. El carrito en sí no cambia — simplemente recibe una línea más por
persona, igual que si se hubiera diseñado a mano.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 add_roster_feature.py
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

PAGE_STATE_OLD = '''  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const setQuantity = (s: string, n: number) => setQuantities((prev) => ({ ...prev, [s]: n }));
  const [view, setView] = useState<View>("front");'''

PAGE_STATE_NEW = '''  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const setQuantity = (s: string, n: number) => setQuantities((prev) => ({ ...prev, [s]: n }));
  const [roster, setRoster] = useState<{ id: string; name: string; number: string; size: string }[]>([]);
  const addRosterEntry = (name: string, number: string, sz: string) => {
    if (!name.trim()) return;
    setRoster((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), number: number.trim(), size: sz }]);
  };
  const removeRosterEntry = (id: string) => setRoster((prev) => prev.filter((r) => r.id !== id));
  const [view, setView] = useState<View>("front");'''

PAGE_TOTALS_OLD = '''  // Suma de unidades elegidas entre todas las tallas (solo aplica cuando NO se está editando una línea).
  const totalQtyAllSizes = Object.values(quantities).reduce((s, n) => s + (n || 0), 0);
  const totalPriceAllSizes = Object.entries(quantities).reduce((sum, [sz, n]) => {
    if (!n) return sum;
    const v = getVariant(p, sz, color.name);
    const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
    return sum + (bp + surcharge) * n;
  }, 0);'''

PAGE_TOTALS_NEW = '''  // Suma de unidades elegidas entre todas las tallas (mostrador + nombres de amigos),
  // solo aplica cuando NO se está editando una línea.
  const totalQtyAllSizes = Object.values(quantities).reduce((s, n) => s + (n || 0), 0) + roster.length;
  const totalPriceAllSizes =
    Object.entries(quantities).reduce((sum, [sz, n]) => {
      if (!n) return sum;
      const v = getVariant(p, sz, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      return sum + (bp + surcharge) * n;
    }, 0) +
    roster.reduce((sum, r) => {
      const v = getVariant(p, r.size, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      return sum + (bp + surcharge);
    }, 0);'''

PAGE_BREAKDOWN_OLD = '''  // Desglose detallado: talla, cantidad, precio unitario y subtotal de cada línea elegida.
  const breakdown = Object.entries(quantities)
    .filter(([, n]) => n > 0)
    .map(([sz, n]) => {
      const v = getVariant(p, sz, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      const unit = bp + surcharge;
      return { size: sz, qty: n, unit, subtotal: unit * n };
    });'''

PAGE_BREAKDOWN_NEW = '''  // Desglose detallado: talla (o nombre), cantidad, precio unitario y subtotal de cada línea elegida.
  const breakdown = [
    ...Object.entries(quantities)
      .filter(([, n]) => n > 0)
      .map(([sz, n]) => {
        const v = getVariant(p, sz, color.name);
        const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
        const unit = bp + surcharge;
        return { label: sz, qty: n, unit, subtotal: unit * n };
      }),
    ...roster.map((r) => {
      const v = getVariant(p, r.size, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      const unit = bp + surcharge;
      return { label: `${r.name}${r.number ? " · " + r.number : ""} (${r.size})`, qty: 1, unit, subtotal: unit };
    }),
  ];'''

PAGE_ONADD_OLD = '''    const entries = Object.entries(quantities).filter(([, n]) => n > 0);
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

PAGE_ONADD_NEW = '''    const bulkEntries = Object.entries(quantities).filter(([, n]) => n > 0);
    if (bulkEntries.length === 0 && roster.length === 0) return;
    for (const [sz, n] of bulkEntries) {
      const v = getVariant(p, sz, color.name);
      add({
        code: p.code, name: p.name, image: color.image, size: sz,
        colorName: color.name, colorHex: color.hex, qty: n,
        tiers: v?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
        elements,
      });
    }
    // Una línea por amigo: mismo diseño, pero con el texto sustituido por su nombre (y número).
    for (const r of roster) {
      const v = getVariant(p, r.size, color.name);
      const personalized = elements.map((el) =>
        el.kind === "text" ? { ...el, text: `${r.name}${r.number ? " " + r.number : ""}`.toUpperCase() } : el
      );
      add({
        code: p.code, name: p.name, image: color.image, size: r.size,
        colorName: color.name, colorHex: color.hex, qty: 1,
        tiers: v?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
        elements: personalized,
      });
    }
    toast.success(t("added"), { description: summary });
    setQuantities({});
    setRoster([]);
    setTimeout(() => setOpen(true), 400);
  };'''

PAGE_PROP_OLD = '''          quantities={quantities} setQuantity={setQuantity}
          breakdown={breakdown}
          priceGroups={priceGroups}
          elements={elements}'''

PAGE_PROP_NEW = '''          quantities={quantities} setQuantity={setQuantity}
          roster={roster} addRosterEntry={addRosterEntry} removeRosterEntry={removeRosterEntry}
          breakdown={breakdown}
          priceGroups={priceGroups}
          elements={elements}'''

# --- ControlPanel.tsx ------------------------------------------------------

PANEL_IMPORT_OLD = 'import { Minus, Plus, Upload, X, Type, ImagePlus, Percent } from "lucide-react";'
PANEL_IMPORT_NEW = 'import { Minus, Plus, Upload, X, Type, ImagePlus, Percent, Users } from "lucide-react";'

PANEL_TYPE_OLD = '''  breakdown: { size: string; qty: number; unit: number; subtotal: number }[];
  priceGroups: { label: string; tiers: { t1_10: number; t11_30: number; t31_100: number; t101_plus: number } }[];
  elements: DesignElement[];'''

PANEL_TYPE_NEW = '''  roster: { id: string; name: string; number: string; size: string }[];
  addRosterEntry: (name: string, number: string, size: string) => void;
  removeRosterEntry: (id: string) => void;
  breakdown: { label: string; qty: number; unit: number; subtotal: number }[];
  priceGroups: { label: string; tiers: { t1_10: number; t11_30: number; t31_100: number; t101_plus: number } }[];
  elements: DesignElement[];'''

PANEL_STATE_OLD = '''  const [showPriceTable, setShowPriceTable] = useState(false);'''

PANEL_STATE_NEW = '''  const [showPriceTable, setShowPriceTable] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [rosterName, setRosterName] = useState("");
  const [rosterNumber, setRosterNumber] = useState("");
  const [rosterSize, setRosterSize] = useState(p.sizes[0] ?? "");'''

PANEL_TABS_END_OLD = '''      </Tabs>

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

PANEL_TABS_END_NEW = '''      </Tabs>

      {!props.isEdit && (
        <section>
          <button
            type="button"
            onClick={() => setShowRoster((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-brand/30 bg-sand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand transition hover:bg-sand/70"
          >
            <Users className="h-3.5 w-3.5 text-gold" />
            Nombres y números
            <span className={`inline-block transition-transform ${showRoster ? "rotate-180" : ""}`}>▾</span>
          </button>
          {showRoster && (
            <div className="mt-3 space-y-3 rounded-lg border border-border p-3">
              <p className="text-[11px] text-muted-foreground">
                Añade cada amigo con su talla. Si has diseñado un texto arriba, se sustituirá por el nombre (y número) de cada persona en su prenda.
              </p>
              <div className="grid grid-cols-[1fr_56px_84px_auto] gap-2">
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
        [
            (PAGE_STATE_OLD, PAGE_STATE_NEW),
            (PAGE_TOTALS_OLD, PAGE_TOTALS_NEW),
            (PAGE_BREAKDOWN_OLD, PAGE_BREAKDOWN_NEW),
            (PAGE_ONADD_OLD, PAGE_ONADD_NEW),
            (PAGE_PROP_OLD, PAGE_PROP_NEW),
        ],
        "product.$code.tsx",
    )
    ok &= patch_file(
        PANEL_FILE,
        [
            (PANEL_IMPORT_OLD, PANEL_IMPORT_NEW),
            (PANEL_TYPE_OLD, PANEL_TYPE_NEW),
            (PANEL_STATE_OLD, PANEL_STATE_NEW),
            (PANEL_TABS_END_OLD, PANEL_TABS_END_NEW),
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
