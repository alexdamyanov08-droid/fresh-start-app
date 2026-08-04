"""
Añade la Composición (columna F del Excel WEB_ROLY.xlsx) a la ficha de cada
artículo, debajo de la Descripción, en la web Xprint Wear (repo fresh-start-app).

CÓMO USARLO (dentro de tu Codespace):
1. Sube este archivo (add_composition.py) y el archivo composition_map.json
   a la raíz del proyecto (la misma carpeta donde está "package.json").
2. Abre una terminal en el Codespace y ejecuta:
       python3 add_composition.py
3. El script modifica dos archivos del proyecto:
       - src/data/products.ts            (añade el campo "composition" a cada artículo)
       - src/components/customizer/ControlPanel.tsx  (muestra esa composición debajo de la descripción)
4. Vuelve a lanzar `npm run dev` (o refresca la vista previa si ya estaba corriendo)
   y entra en la ficha de cualquier artículo para comprobar que aparece.
5. Cuando lo hayas comprobado, guarda los cambios con git (commit) como haces siempre.

No hace falta el Excel para ejecutar esto: los textos de composición ya están
incluidos dentro de composition_map.json, extraídos previamente del Excel.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRODUCTS_FILE = ROOT / "src" / "data" / "products.ts"
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"
MAP_FILE = ROOT / "composition_map.json"


def fail(msg: str) -> None:
    print(f"\n❌ {msg}\n")
    sys.exit(1)


def main() -> None:
    if not PRODUCTS_FILE.exists():
        fail(
            f"No encuentro {PRODUCTS_FILE}. Asegúrate de haber puesto este "
            f"script en la carpeta raíz del proyecto (donde está package.json)."
        )
    if not MAP_FILE.exists():
        fail(
            f"No encuentro {MAP_FILE}. Sube también el archivo "
            f"composition_map.json junto a este script, en la misma carpeta."
        )

    comp_map = json.loads(MAP_FILE.read_text(encoding="utf-8"))

    content = PRODUCTS_FILE.read_text(encoding="utf-8")

    # 1) Añadir el campo "composition" al tipo Product (si no está ya)
    if "composition:" not in content.split("export const products", 1)[0]:
        content = content.replace(
            "colors: ColorVariant[];\n};",
            "colors: ColorVariant[]; composition?: string;\n};",
        )

    # 2) Parsear el array de productos y añadir la composición a cada uno
    marker = "export const products: Product[] = "
    if marker not in content:
        fail("No encuentro el array de productos dentro de products.ts. "
             "¿Se ha modificado el formato del archivo?")

    start = content.index(marker) + len(marker)
    end = content.rindex("];") + 1
    arr_str = content[start:end]

    try:
        products = json.loads(arr_str)
    except json.JSONDecodeError as e:
        fail(f"No he podido leer el array de productos (error: {e}). "
             "No se ha modificado nada.")

    missing = []
    for p in products:
        comp = comp_map.get(p.get("code"))
        if comp:
            p["composition"] = comp
        else:
            missing.append(p.get("code"))

    new_arr_str = json.dumps(products, ensure_ascii=False, separators=(",", ": "))
    new_content = content[:start] + new_arr_str + content[end:]
    PRODUCTS_FILE.write_text(new_content, encoding="utf-8")

    print(f"✅ Actualizado {PRODUCTS_FILE.relative_to(ROOT)} "
          f"({len(products) - len(missing)} de {len(products)} artículos con composición añadida)")
    if missing:
        print(f"   ⚠️  Sin composición encontrada para estos códigos: {missing}")

    # 3) Mostrar la composición debajo de la descripción en la ficha de producto
    if PANEL_FILE.exists():
        panel = PANEL_FILE.read_text(encoding="utf-8")
        old_line = '{p.desc && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.desc}</p>}'
        new_block = (
            '{p.desc && <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>}\n'
            '        {p.composition && <p className="mt-1 text-sm text-muted-foreground">{p.composition}</p>}'
        )
        if old_line in panel:
            panel = panel.replace(old_line, new_block)
            PANEL_FILE.write_text(panel, encoding="utf-8")
            print(f"✅ Actualizado {PANEL_FILE.relative_to(ROOT)} (la composición ahora se muestra debajo de la descripción)")
        elif "p.composition" in panel:
            print(f"ℹ️  {PANEL_FILE.relative_to(ROOT)} ya mostraba la composición, no he tocado nada.")
        else:
            print(
                f"⚠️  No he encontrado la línea exacta que esperaba en "
                f"{PANEL_FILE.relative_to(ROOT)}. Puede que alguien ya la haya "
                f"cambiado. Revísala a mano: busca la línea que muestra "
                f"'p.desc' y añade justo debajo:\n"
                f"   {{p.composition && <p className=\"mt-1 text-sm text-muted-foreground\">{{p.composition}}</p>}}"
            )
    else:
        print(f"⚠️  No encuentro {PANEL_FILE}. Añade tú la línea de composición donde se muestre la descripción.")

    print("\nListo. Ahora reinicia el servidor (npm run dev) y revisa una ficha de artículo.")


if __name__ == "__main__":
    main()
