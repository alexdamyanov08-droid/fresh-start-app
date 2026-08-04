"""
Le da al recuadro "Resumen del pedido" un fondo de color propio, para que se
distinga claramente de la lista de tallas de arriba.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 style_price_breakdown.py
3. Relanza el servidor (npm run dev) y haz Ctrl+Shift+R en el navegador.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

OLD_HEADER = '''              <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Resumen del pedido</p>
              <div className="space-y-1.5 rounded-lg border border-border p-3 text-sm">'''

NEW_HEADER = '''              <p className="mb-2 text-xs font-semibold uppercase tracking-widest">Resumen del pedido</p>
              <div className="space-y-1.5 rounded-xl border border-foreground/10 bg-foreground p-4 text-sm text-background">'''

OLD_ROW = '''                    <span className="text-muted-foreground">
                      €{b.unit.toFixed(2)} /ud · <span className="font-semibold text-foreground">€{b.subtotal.toFixed(2)}</span>
                    </span>'''

NEW_ROW = '''                    <span className="text-background/70">
                      €{b.unit.toFixed(2)} /ud · <span className="font-semibold text-background">€{b.subtotal.toFixed(2)}</span>
                    </span>'''


def main() -> None:
    if not PANEL_FILE.exists():
        print(f"\n❌ No encuentro {PANEL_FILE}. ¿Está el script en la raíz del proyecto?\n")
        sys.exit(1)

    content = PANEL_FILE.read_text(encoding="utf-8")
    original = content

    for old, new, label in [(OLD_HEADER, NEW_HEADER, "el recuadro"), (OLD_ROW, NEW_ROW, "el color del texto")]:
        if old not in content:
            if new in content:
                print(f"ℹ️  Ya estaba aplicado el cambio de {label}, no toco nada.")
                continue
            print(
                f"\n❌ No encuentro el texto esperado para {label} en ControlPanel.tsx. "
                f"No se ha cambiado nada. Pégame de nuevo el contenido completo del archivo "
                f"para ajustarlo.\n"
            )
            sys.exit(1)
        content = content.replace(old, new, 1)

    if content != original:
        PANEL_FILE.write_text(content, encoding="utf-8")
        print(f"✅ Actualizado {PANEL_FILE.relative_to(ROOT)}")
        print("\nListo. Relanza npm run dev y haz Ctrl+Shift+R para verlo.")
    else:
        print("ℹ️  No hacía falta cambiar nada, ya estaba aplicado.")


if __name__ == "__main__":
    main()
