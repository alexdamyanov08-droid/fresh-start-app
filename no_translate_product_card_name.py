"""
Igual que en la ficha de artículo: evita que el traductor del navegador
cambie el nombre del artículo en las tarjetas del listado de la tienda.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 no_translate_product_card_name.py
3. Relanza el servidor (npm run dev) y haz Ctrl+Shift+R en el navegador.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CARD_FILE = ROOT / "src" / "components" / "catalog" / "ProductCard.tsx"

OLD = '''          <p className="truncate font-display text-lg uppercase leading-tight">{p.name}</p>'''

NEW = '''          <p translate="no" className="notranslate truncate font-display text-lg uppercase leading-tight">{p.name}</p>'''


def main() -> None:
    if not CARD_FILE.exists():
        print(f"\n❌ No encuentro {CARD_FILE}. ¿Está el script en la raíz del proyecto?\n")
        sys.exit(1)

    content = CARD_FILE.read_text(encoding="utf-8")

    if NEW in content:
        print("ℹ️  Ya estaba aplicado este cambio, no toco nada.")
        return

    if OLD not in content:
        print(
            "\n❌ No encuentro el texto esperado en ProductCard.tsx. "
            "No se ha cambiado nada. Pégame de nuevo el contenido completo del "
            "archivo (cat src/components/catalog/ProductCard.tsx) para ajustarlo.\n"
        )
        sys.exit(1)

    content = content.replace(OLD, NEW, 1)
    CARD_FILE.write_text(content, encoding="utf-8")
    print(f"✅ Actualizado {CARD_FILE.relative_to(ROOT)}")
    print("\nListo. Relanza npm run dev y haz Ctrl+Shift+R para verlo.")


if __name__ == "__main__":
    main()
