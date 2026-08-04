#!/usr/bin/env python3
"""
Añade un campo "sizeChart" (medidas por talla, en cm) a cada artículo de
src/data/products.ts, usando los datos de sizechart_data.json.

Uso:
    python3 add_size_chart.py

Requiere que este script y sizechart_data.json estén en la RAÍZ del
repositorio (mismo nivel que la carpeta src/), o ajusta las rutas abajo.
"""

import json
import re
import sys
from pathlib import Path

PRODUCTS_PATH = Path("src/data/products.ts")
DATA_PATH = Path("sizechart_data.json")


def main():
    if not PRODUCTS_PATH.exists():
        print(f"ERROR: no encuentro {PRODUCTS_PATH}. Ejecuta este script desde la raíz del repo.")
        sys.exit(1)
    if not DATA_PATH.exists():
        print(f"ERROR: no encuentro {DATA_PATH}. Debe estar en la misma carpeta que este script.")
        sys.exit(1)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        size_chart_data = json.load(f)

    text = PRODUCTS_PATH.read_text(encoding="utf-8")

    # Encuentra cada bloque de artículo: "code": "XXXX" ... "sizes": [ ... ]
    # (la palabra "sizes" en plural solo aparece una vez por artículo;
    #  "size" en singular aparece muchas veces dentro de "variants", pero
    #  ese no lleva las comillas + dos puntos de "sizes":)
    pattern = re.compile(
        r'("code":\s*"([A-Za-z0-9]+)".*?"sizes":\s*\[[^\]]*\])',
        re.DOTALL,
    )

    updated_count = 0
    skipped_no_data = []
    skipped_already = 0

    def replacer(match):
        nonlocal updated_count, skipped_already
        full_match = match.group(1)
        code = match.group(2)

        if code not in size_chart_data:
            skipped_no_data.append(code)
            return full_match

        # Si ya existe un sizeChart justo después (por si se re-ejecuta el script), no duplicar
        end_pos = match.end()
        lookahead = text[end_pos:end_pos + 20]
        if lookahead.strip().startswith(',"sizeChart"'):
            skipped_already += 1
            return full_match

        chart = size_chart_data[code]
        chart_json = json.dumps(chart, ensure_ascii=False)
        updated_count += 1
        return full_match + ',"sizeChart": ' + chart_json

    new_text = pattern.sub(replacer, text)

    PRODUCTS_PATH.write_text(new_text, encoding="utf-8")

    print(f"✅ Artículos actualizados con sizeChart: {updated_count}")
    if skipped_already:
        print(f"ℹ️  Ya tenían sizeChart (no tocados de nuevo): {skipped_already}")
    if skipped_no_data:
        print(f"⚠️  Artículos SIN medidas en el Excel (no se les añadió tabla): {len(skipped_no_data)}")
        print("    Códigos:", ", ".join(skipped_no_data))


if __name__ == "__main__":
    main()
