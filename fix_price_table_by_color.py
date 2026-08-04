"""
Arregla un fallo real: la tabla "Ver precios por cantidad" siempre calculaba
los precios usando el PRIMER color de la lista, así que para artículos donde
el color sí cambia el precio (los hay, más de 300 combinaciones en el
catálogo), mostraba un precio incorrecto para el resto de colores.

Ahora la tabla se recalcula según el color que tengas seleccionado en cada
momento, y añade una nota dejándolo claro.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 fix_price_table_by_color.py
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

PAGE_OLD = '''  // Agrupa las tallas que comparten exactamente los mismos precios por tramo de cantidad
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

PAGE_NEW = '''  // Agrupa las tallas que comparten exactamente los mismos precios por tramo de cantidad
  // PARA EL COLOR SELECCIONADO (el color a veces sí cambia el precio, según el artículo),
  // para la tabla desplegable de precios.
  const priceGroups = useMemo(() => {
    const map = new Map<string, { tiers: any; sizes: string[] }>();
    for (const s of p.sizes) {
      const v = getVariant(p, s, color.name);
      if (!v) continue;
      const key = JSON.stringify(v.tiers);
      if (!map.has(key)) map.set(key, { tiers: v.tiers, sizes: [] });
      map.get(key)!.sizes.push(s);
    }
    return Array.from(map.values()).map((g) => ({
      label: g.sizes.length > 3 ? `${g.sizes[0]}\u2013${g.sizes[g.sizes.length - 1]}` : g.sizes.join(", "),
      tiers: g.tiers,
    }));
  }, [p, color.name]);'''

PANEL_OLD = '''              <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                El color no cambia el precio, solo la talla.
              </p>'''

PANEL_NEW = '''              <p className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                Precios para el color <span translate="no" className="notranslate font-medium">{props.color.name}</span>. En algunos artículos el color cambia el precio: cambia de color para ver el resto.
              </p>'''


def fail(msg: str) -> None:
    print(f"\n❌ {msg}\n")


def patch_file(path: Path, old: str, new: str, label: str) -> bool:
    if not path.exists():
        fail(f"No encuentro {path}. ¿Está el script en la raíz del proyecto?")
        return False
    content = path.read_text(encoding="utf-8")
    if new in content:
        print(f"ℹ️  {label}: ya tenía este cambio aplicado, no toco nada.")
        return True
    if old not in content:
        fail(
            f"No encuentro el texto esperado en {path.relative_to(ROOT)}. "
            f"No se ha cambiado nada de este archivo; pégame de nuevo su contenido "
            f"completo para ajustarlo."
        )
        return False
    content = content.replace(old, new, 1)
    path.write_text(content, encoding="utf-8")
    print(f"✅ Actualizado {path.relative_to(ROOT)}")
    return True


def main() -> None:
    ok = True
    ok &= patch_file(PAGE_FILE, PAGE_OLD, PAGE_NEW, "product.$code.tsx")
    ok &= patch_file(PANEL_FILE, PANEL_OLD, PANEL_NEW, "ControlPanel.tsx")

    if ok:
        print("\nListo. Ahora ejecuta:")
        print("    pkill -f vite")
        print("    npm run dev")
        print("Y Ctrl+Shift+R en el navegador.")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
