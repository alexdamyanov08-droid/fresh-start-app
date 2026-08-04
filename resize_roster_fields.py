"""
Hace el campo Nombre un poco más pequeño y el campo de Talla más grande,
en el desplegable de personalización por prenda.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 resize_roster_fields.py
3. Relanza el servidor (npm run dev) y haz Ctrl+Shift+R en el navegador.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

OLD = '<div className="grid grid-cols-[1fr_56px_84px_auto] gap-2">'
NEW = '<div className="grid grid-cols-[1fr_56px_130px_auto] gap-2">'


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
