#!/usr/bin/env python3
"""
Arregla las miniaturas de producto en el carrito, checkout y "Mis pedidos"
que se veían como un bloque de color liso en vez de mostrar la prenda.

Causa: el recuadro de la miniatura tenia como fondo el color exacto de la
prenda (ej. azul Royal, rojo) y la foto se pinta encima con la tecnica
"mix-blend-multiply". Sobre un fondo del MISMO color, esa tecnica aplana la
imagen y se pierde toda la forma y el sombreado. La solucion es usar fondo
blanco, igual que ya funciona bien en las tarjetas del catalogo.

Uso: colocar este archivo en la raiz del repo (fresh-start-app) y ejecutar:
    python3 fix_miniaturas_carrito.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


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


edit_file(
    "src/components/cart/CartDrawer.tsx",
    [
        (
            '                  <div\n'
            '                    className="h-20 w-20 shrink-0 rounded-md border border-border"\n'
            '                    style={{ backgroundColor: i.colorHex }}\n'
            '                  >',
            '                  <div\n'
            '                    className="h-20 w-20 shrink-0 rounded-md border border-border"\n'
            '                    style={{ backgroundColor: "#ffffff" }}\n'
            '                  >',
            "fondo blanco en la miniatura del carrito",
        ),
    ],
)

edit_file(
    "src/routes/checkout.tsx",
    [
        (
            '                    <div\n'
            '                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border"\n'
            '                      style={{ backgroundColor: i.colorHex }}\n'
            '                    >',
            '                    <div\n'
            '                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border"\n'
            '                      style={{ backgroundColor: "#ffffff" }}\n'
            '                    >',
            "fondo blanco en la miniatura del checkout",
        ),
    ],
)

edit_file(
    "src/routes/account.tsx",
    [
        (
            '                        <div\n'
            '                          className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border"\n'
            '                          style={{ backgroundColor: i.colorHex }}\n'
            '                        >',
            '                        <div\n'
            '                          className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border"\n'
            '                          style={{ backgroundColor: "#ffffff" }}\n'
            '                        >',
            "fondo blanco en la miniatura de Mis pedidos",
        ),
    ],
)

print("\nListo. Revisa los mensajes de arriba: si todo dice 'OK: aplicado',")
print("reinicia el servidor (pkill -f vite && npm run dev) y haz Ctrl+Shift+R en el navegador.")
