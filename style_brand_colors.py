"""
Usa tus colores de marca reales (los mismos del banner de arriba: bg-brand,
text-brand, text-gold, bg-gold, bg-sand) para:
  1. Hacer más llamativo el título "Ver precios por cantidad".
  2. Poner el botón "Sube tu logotipo" en esos colores en vez de negro.

No inventa colores nuevos: reutiliza las clases que ya existen en tu proyecto.

Es seguro volver a ejecutarlo: si ya está aplicado, no toca nada.

CÓMO USARLO:
1. Sube este archivo a la raíz del proyecto.
2. En la terminal:
       python3 style_brand_colors.py
3. Relanza el servidor (npm run dev) y haz Ctrl+Shift+R en el navegador.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PANEL_FILE = ROOT / "src" / "components" / "customizer" / "ControlPanel.tsx"

OLD_IMPORT = 'import { Minus, Plus, Upload, X, Type, ImagePlus } from "lucide-react";'
NEW_IMPORT = 'import { Minus, Plus, Upload, X, Type, ImagePlus, Percent } from "lucide-react";'

OLD_TOGGLE = '''            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            <span className={`inline-block transition-transform ${showPriceTable ? "rotate-180" : ""}`}>▾</span>
            Ver precios por cantidad
          </button>'''

NEW_TOGGLE = '''            className="flex items-center gap-2 rounded-full border border-brand/30 bg-sand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand transition hover:bg-sand/70"
          >
            <Percent className="h-3.5 w-3.5 text-gold" />
            Ver precios por cantidad
            <span className={`inline-block transition-transform ${showPriceTable ? "rotate-180" : ""}`}>▾</span>
          </button>'''

OLD_UPLOAD_BTN = '''            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-3 text-sm font-semibold uppercase tracking-widest text-background transition hover:opacity-90"
          >
            <ImagePlus className="h-4 w-4" /> {t("upload_logo")}
          </button>'''

NEW_UPLOAD_BTN = '''            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-gold bg-brand px-4 py-3 text-sm font-semibold uppercase tracking-widest text-brand-foreground transition hover:opacity-90"
          >
            <ImagePlus className="h-4 w-4 text-gold" /> {t("upload_logo")}
          </button>'''


def main() -> None:
    if not PANEL_FILE.exists():
        print(f"\n❌ No encuentro {PANEL_FILE}. ¿Está el script en la raíz del proyecto?\n")
        sys.exit(1)

    content = PANEL_FILE.read_text(encoding="utf-8")
    original = content

    for old, new, label in [
        (OLD_IMPORT, NEW_IMPORT, "el icono de precios"),
        (OLD_TOGGLE, NEW_TOGGLE, "el título de precios por cantidad"),
        (OLD_UPLOAD_BTN, NEW_UPLOAD_BTN, "el botón de subir logo"),
    ]:
        if new in content:
            print(f"ℹ️  Ya estaba aplicado el cambio de {label}, no toco nada.")
            continue
        if old not in content:
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
