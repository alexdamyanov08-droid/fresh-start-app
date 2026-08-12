#!/usr/bin/env python3
"""
Arregla el bug: los logos/textos añadidos en una perspectiva (delante, espalda,
izquierda, derecha) aparecían también en las demás perspectivas.

A partir de ahora cada logo/texto se guarda con la perspectiva a la que
pertenece, y el visor + el panel de edición solo muestran los de la
perspectiva activa. El precio sigue sumando TODOS los logos/textos de
TODAS las perspectivas, como debe ser.

Uso: colocar este archivo en la raíz del repo (fresh-start-app) y ejecutar:
    python3 fix_perspectivas_independientes.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

CHANGES = []  # (archivo, [(buscar, reemplazar, descripcion), ...])


def edit_file(relpath, replacements):
    path = ROOT / relpath
    if not path.exists():
        print(f"ERROR: no encuentro {relpath} en {ROOT}")
        sys.exit(1)
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new, desc in replacements:
        count = text.count(old)
        if count == 0:
            print(f"AVISO: no encontrado en {relpath} -> {desc} (¿ya estaba aplicado?)")
            continue
        if count > 1:
            print(f"AVISO: '{desc}' aparece {count} veces en {relpath}, se reemplazan todas")
        text = text.replace(old, new)
        print(f"OK: aplicado en {relpath} -> {desc}")
    if text != original:
        path.write_text(text, encoding="utf-8")
    else:
        print(f"(sin cambios en {relpath})")


# 1) src/lib/cart-store.tsx -----------------------------------------------
edit_file(
    "src/lib/cart-store.tsx",
    [
        (
            'export type DesignElement = {\n  id: string;\n  kind: "image" | "text";\n  image?: string | null;',
            'export type DesignElement = {\n  id: string;\n  kind: "image" | "text";\n  view: "front" | "back" | "left" | "right"; // perspectiva de la prenda a la que pertenece este elemento\n  image?: string | null;',
            "añadir campo 'view' al tipo DesignElement",
        ),
    ],
)

# 2) src/routes/product.$code.tsx ------------------------------------------
edit_file(
    "src/routes/product.$code.tsx",
    [
        (
            'id: crypto.randomUUID(), kind: "image", image: dataUrl,',
            'id: crypto.randomUUID(), kind: "image", view, image: dataUrl,',
            "guardar la vista activa al crear un logo",
        ),
        (
            'id: crypto.randomUUID(), kind: "text", text: "", font: "brutal", color: "#0a0a0a",',
            'id: crypto.randomUUID(), kind: "text", view, text: "", font: "brutal", color: "#0a0a0a",',
            "guardar la vista activa al crear un texto",
        ),
        (
            "          priceGroups={priceGroups}\n          elements={elements}\n          selectedId={selectedId} setSelectedId={setSelectedId}",
            "          priceGroups={priceGroups}\n          elements={elements}\n          view={view}\n          selectedId={selectedId} setSelectedId={setSelectedId}",
            "pasar la vista activa al ControlPanel",
        ),
    ],
)

# 3) src/components/customizer/Viewer.tsx -----------------------------------
edit_file(
    "src/components/customizer/Viewer.tsx",
    [
        (
            "  const selected = props.elements.find((el) => el.id === props.selectedId) ?? null;",
            '  // Solo los elementos (logos/textos) que pertenecen a la perspectiva activa.\n'
            '  // El fallback a "front" mantiene compatible los diseños guardados antes de este cambio.\n'
            '  const visibleElements = props.elements.filter((el) => (el.view ?? "front") === props.view);\n'
            "  const selected = visibleElements.find((el) => el.id === props.selectedId) ?? null;",
            "filtrar elementos visibles por perspectiva activa",
        ),
        (
            "            {/* Design elements for this view */}\n            {props.elements.map((el) => {",
            "            {/* Design elements for this view */}\n            {visibleElements.map((el) => {",
            "pintar en canvas solo los elementos de la vista activa",
        ),
    ],
)

# 4) src/components/customizer/ControlPanel.tsx ------------------------------
edit_file(
    "src/components/customizer/ControlPanel.tsx",
    [
        (
            'import type { DesignElement } from "@/lib/cart-store";\nimport { useI18n } from "@/lib/i18n";',
            'import type { DesignElement } from "@/lib/cart-store";\nimport type { View } from "@/components/customizer/Viewer";\nimport { useI18n } from "@/lib/i18n";',
            "importar el tipo View",
        ),
        (
            "export function ControlPanel(props: {\n  product: Product;\n  isEdit: boolean;",
            "export function ControlPanel(props: {\n  product: Product;\n  isEdit: boolean;\n  view: View;",
            "añadir prop 'view' a ControlPanel",
        ),
        (
            '  const images = props.elements.filter((el) => el.kind === "image");\n  const texts = props.elements.filter((el) => el.kind === "text");',
            "  // Solo se listan/editan aquí los logos y textos de la perspectiva activa.\n"
            '  const images = props.elements.filter((el) => el.kind === "image" && (el.view ?? "front") === props.view);\n'
            '  const texts = props.elements.filter((el) => el.kind === "text" && (el.view ?? "front") === props.view);',
            "filtrar logos/textos listados por perspectiva activa",
        ),
    ],
)

print("\nListo. Revisa los mensajes de arriba: si todo dice 'OK: aplicado',")
print("reinicia el servidor (pkill -f vite && npm run dev) y haz Ctrl+Shift+R en el navegador.")
