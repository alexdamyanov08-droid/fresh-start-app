#!/usr/bin/env python3
"""
Arreglo definitivo: saca la tabla de tallas de la columna de la foto (donde
chocaba con el efecto "sticky") y la coloca como una franja aparte debajo de
toda la sección, con un ancho ajustado para que en ordenador quede alineada
bajo la zona de la foto.

Uso:
    python3 fix_size_chart_sticky_conflict.py
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

    # 1) Revertir el envoltorio alrededor del Viewer (volver a como estaba,
    #    sin la tabla metida dentro de la misma columna que la foto).
    wrapped_block = '''        <div>
          <div className="h-[70vh] min-h-[420px] md:sticky md:top-20 md:h-[calc(100vh-8rem)]">
            <Viewer
              productCode={p.code}
              color={color} view={view} setView={setView}
              elements={elements}
              selectedId={selectedId} setSelectedId={setSelectedId}
              updateElement={updateElement} removeElement={removeElement}
            />
          </div>
          {/* Tabla de tallas: en ordenador va aquí, debajo de la foto */}
          <div className="relative z-10 mt-4 hidden md:block">
            <SizeChart sizeChart={p.sizeChart} selectedSize={size} />
          </div>
        </div>'''

    unwrapped_block = '''        <div className="h-[70vh] min-h-[420px] md:sticky md:top-20 md:h-[calc(100vh-8rem)]">
          <Viewer
            productCode={p.code}
            color={color} view={view} setView={setView}
            elements={elements}
            selectedId={selectedId} setSelectedId={setSelectedId}
            updateElement={updateElement} removeElement={removeElement}
          />
        </div>'''

    if wrapped_block in text:
        text = text.replace(wrapped_block, unwrapped_block, 1)
        changes.append("columna de la foto revertida a su forma original (ya no choca con el sticky)")
    elif unwrapped_block in text:
        changes.append("la columna de la foto ya estaba en su forma original")
    else:
        print("⚠️  No encontré el bloque de la foto tal cual lo esperaba (ni la versión nueva ni la antigua).")

    # 2) Sustituir el bloque de la tabla "solo móvil" por uno único, visible
    #    en ambos, colocado debajo de TODA la sección (foto + controles),
    #    con un ancho ajustado en ordenador para que quede bajo la foto.
    mobile_only_block = '''      {/* Tabla de tallas: en móvil va al final de todo */}
      <div className="relative z-10 mt-6 md:hidden">
        <SizeChart sizeChart={p.sizeChart} selectedSize={size} />
      </div>'''

    unified_block = '''      {/* Tabla de tallas: debajo de la foto en ordenador, al final de todo en móvil */}
      <div className="mt-6 md:mt-4 md:max-w-[56%]">
        <SizeChart sizeChart={p.sizeChart} selectedSize={size} />
      </div>'''

    if "debajo de la foto en ordenador, al final de todo en móvil" in text:
        changes.append("el bloque unificado ya estaba presente (no duplicado)")
    elif mobile_only_block in text:
        text = text.replace(mobile_only_block, unified_block, 1)
        changes.append("tabla unificada: ahora visible en ordenador y móvil, sin chocar con el sticky")
    else:
        print("⚠️  No encontré el bloque de móvil tal cual lo esperaba.")

    if text != original_text:
        PRODUCT_PAGE.write_text(text, encoding="utf-8")

    print("\nResumen:")
    for c in changes:
        print(" -", c)


if __name__ == "__main__":
    main()
