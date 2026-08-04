"""
Hace que el número de la cantidad, en cada talla de la lista nueva, se pueda
escribir directamente (además de seguir pudiendo usar los botones - y +).

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto (junto a package.json).
2. En la terminal:
       python3 make_quantity_typeable.py
3. Relanza npm run dev y prueba: en la ficha de un artículo (sin estar
   editando una línea del carrito), haz clic sobre el número de cualquier
   talla y escribe la cantidad directamente.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

OLD = '''                    <span className="w-8 text-center text-sm font-semibold">{qty}</span>'''

NEW = '''                    <input
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
                    />'''


def main() -> None:
    if not PANEL_FILE.exists():
        print(f"\n❌ No encuentro {PANEL_FILE}. ¿Está el script en la raíz del proyecto?\n")
        sys.exit(1)

    content = PANEL_FILE.read_text(encoding="utf-8")

    if OLD not in content:
        if NEW in content:
            print("ℹ️  Ya estaba aplicado este cambio, no toco nada.")
            return
        print(
            "\n❌ No encuentro el texto esperado en ControlPanel.tsx. "
            "No se ha cambiado nada. Pégame de nuevo el contenido completo del "
            "archivo (cat src/components/customizer/ControlPanel.tsx) para ajustarlo.\n"
        )
        sys.exit(1)

    content = content.replace(OLD, NEW, 1)
    PANEL_FILE.write_text(content, encoding="utf-8")
    print(f"✅ Actualizado {PANEL_FILE.relative_to(ROOT)}")
    print("\nListo. Reinicia el servidor (npm run dev) y prueba a escribir en el campo de cantidad de una talla.")


if __name__ == "__main__":
    main()
