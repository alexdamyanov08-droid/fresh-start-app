#!/usr/bin/env python3
"""
Arregla el problema de la tabla de tallas apareciendo tapada: le añade
posición relativa y prioridad de capa (z-index) para que siempre se vea
por encima de la foto/visor.

Uso:
    python3 fix_size_chart_visibility.py
"""

import sys
from pathlib import Path

PRODUCT_PAGE = Path("src/routes/product.$code.tsx")


def main():
    if not PRODUCT_PAGE.exists():
        print(f"ERROR: no encuentro {PRODUCT_PAGE}. Ejecuta esto desde la raíz del repo.")
        sys.exit(1)

    text = PRODUCT_PAGE.read_text(encoding="utf-8")
    original_text = text
    changes = []

    desktop_old = '<div className="mt-4 hidden md:block">'
    desktop_new = '<div className="relative z-10 mt-4 hidden md:block">'
    if desktop_new in text:
        changes.append("bloque de ordenador ya estaba arreglado (no duplicado)")
    elif desktop_old in text:
        text = text.replace(desktop_old, desktop_new, 1)
        changes.append("bloque de ordenador: z-index añadido")
    else:
        print("⚠️  No encontré el bloque de ordenador tal cual lo esperaba.")

    mobile_old = '<div className="mt-6 md:hidden">'
    mobile_new = '<div className="relative z-10 mt-6 md:hidden">'
    if mobile_new in text:
        changes.append("bloque de móvil ya estaba arreglado (no duplicado)")
    elif mobile_old in text:
        text = text.replace(mobile_old, mobile_new, 1)
        changes.append("bloque de móvil: z-index añadido")
    else:
        print("⚠️  No encontré el bloque de móvil tal cual lo esperaba.")

    if text != original_text:
        PRODUCT_PAGE.write_text(text, encoding="utf-8")

    print("\nResumen:")
    for c in changes:
        print(" -", c)


if __name__ == "__main__":
    main()
