#!/usr/bin/env python3
"""
Paso 2: crea el componente SizeChart y lo coloca en la ficha del artículo
(debajo de la foto en ordenador, al final de todo en móvil).

Uso:
    python3 add_size_chart_ui.py

Requiere que este script y size_chart_component.tsx estén en la RAÍZ del
repositorio.
"""

import sys
from pathlib import Path

REPO_ROOT = Path(".")
COMPONENT_SRC = Path("size_chart_component.tsx")
COMPONENT_DEST = Path("src/components/customizer/SizeChart.tsx")
PRODUCT_PAGE = Path("src/routes/product.$code.tsx")


def main():
    if not COMPONENT_SRC.exists():
        print(f"ERROR: no encuentro {COMPONENT_SRC}. Debe estar en la raíz del repo.")
        sys.exit(1)
    if not PRODUCT_PAGE.exists():
        print(f"ERROR: no encuentro {PRODUCT_PAGE}. Ejecuta esto desde la raíz del repo.")
        sys.exit(1)

    # 1) Crear el componente
    COMPONENT_DEST.parent.mkdir(parents=True, exist_ok=True)
    if COMPONENT_DEST.exists():
        print(f"ℹ️  {COMPONENT_DEST} ya existe, no lo sobrescribo. Bórralo antes si quieres una versión nueva.")
    else:
        COMPONENT_DEST.write_text(COMPONENT_SRC.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"✅ Creado {COMPONENT_DEST}")

    text = PRODUCT_PAGE.read_text(encoding="utf-8")
    original_text = text
    changes = []

    # 2) Añadir el import (justo después del import de ControlPanel)
    import_marker = 'import { ControlPanel } from "@/components/customizer/ControlPanel";'
    import_line = 'import { SizeChart } from "@/components/customizer/SizeChart";'
    if import_line in text:
        changes.append("import ya estaba presente (no duplicado)")
    elif import_marker in text:
        text = text.replace(import_marker, import_marker + "\n" + import_line, 1)
        changes.append("import añadido")
    else:
        print("⚠️  No encontré la línea de import de ControlPanel. No se pudo añadir el import automáticamente.")

    # 3) Envolver el visor en un contenedor y añadir la tabla debajo (versión ordenador)
    viewer_block_old = '''        <div className="h-[70vh] min-h-[420px] md:sticky md:top-20 md:h-[calc(100vh-8rem)]">
          <Viewer
            productCode={p.code}
            color={color} view={view} setView={setView}
            elements={elements}
            selectedId={selectedId} setSelectedId={setSelectedId}
            updateElement={updateElement} removeElement={removeElement}
          />
        </div>'''

    viewer_block_new = '''        <div>
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
          <div className="mt-4 hidden md:block">
            <SizeChart sizeChart={p.sizeChart} selectedSize={size} />
          </div>
        </div>'''

    if "Tabla de tallas: en ordenador" in text:
        changes.append("bloque de ordenador ya estaba presente (no duplicado)")
    elif viewer_block_old in text:
        text = text.replace(viewer_block_old, viewer_block_new, 1)
        changes.append("bloque de ordenador añadido (debajo de la foto)")
    else:
        print("⚠️  No encontré el bloque del Viewer tal cual lo esperaba. No se pudo insertar la versión de ordenador.")
        print("    (Puede que el archivo haya cambiado desde la última vez que lo revisamos.)")

    # 4) Añadir la tabla al final de todo, para móvil (justo antes de la barra fija inferior)
    sticky_bar_marker = "      {/* Sticky action bar */}"
    mobile_block = '''      {/* Tabla de tallas: en móvil va al final de todo */}
      <div className="mt-6 md:hidden">
        <SizeChart sizeChart={p.sizeChart} selectedSize={size} />
      </div>

'''
    if "en móvil va al final de todo" in text:
        changes.append("bloque de móvil ya estaba presente (no duplicado)")
    elif sticky_bar_marker in text:
        text = text.replace(sticky_bar_marker, mobile_block + sticky_bar_marker, 1)
        changes.append("bloque de móvil añadido (al final, antes de la barra inferior)")
    else:
        print("⚠️  No encontré el comentario '{/* Sticky action bar */}'. No se pudo insertar la versión móvil.")

    if text != original_text:
        PRODUCT_PAGE.write_text(text, encoding="utf-8")

    print("\nResumen:")
    for c in changes:
        print(" -", c)


if __name__ == "__main__":
    main()
