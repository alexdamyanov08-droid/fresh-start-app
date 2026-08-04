"""
Evita que el traductor del navegador cambie el nombre del artículo (por
ejemplo que "Honey" se convierta en "Miel"). Marca el título con
translate="no", que tanto el traductor de Google como el de Chrome
respetan.

Esto arregla la FICHA de artículo. Para el listado de la tienda (las
tarjetas de producto), pídeme el archivo ProductCard.tsx y te preparo un
segundo script.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 no_translate_product_name.py
3. Relanza el servidor (npm run dev) y haz Ctrl+Shift+R en el navegador.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

OLD = '''        <h1 className="mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
          {p.name}
        </h1>'''

NEW = '''        <h1
          translate="no"
          className="notranslate mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl"
        >
          {p.name}
        </h1>'''


def main() -> None:
    if not PANEL_FILE.exists():
        print(f"\n❌ No encuentro {PANEL_FILE}. ¿Está el script en la raíz del proyecto?\n")
        sys.exit(1)

    content = PANEL_FILE.read_text(encoding="utf-8")

    if NEW in content:
        print("ℹ️  Ya estaba aplicado este cambio, no toco nada.")
        return

    if OLD not in content:
        print(
            "\n❌ No encuentro el texto esperado en ControlPanel.tsx. "
            "No se ha cambiado nada. Pégame de nuevo el contenido completo del "
            "archivo (cat src/components/customizer/ControlPanel.tsx) para ajustarlo.\n"
        )
        sys.exit(1)

    content = content.replace(OLD, NEW, 1)
    PANEL_FILE.write_text(content, encoding="utf-8")
    print(f"✅ Actualizado {PANEL_FILE.relative_to(ROOT)}")
    print("\nListo. Relanza npm run dev y haz Ctrl+Shift+R para verlo.")


if __name__ == "__main__":
    main()
