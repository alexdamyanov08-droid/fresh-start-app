#!/usr/bin/env python3
"""
Arregla la seccion "¿Que quieres personalizar?" de la pagina de inicio:
1. Las 4 tarjetas (Camisetas, Sudaderas, Polos, antes "Softshells") llevaban
   todas a "/shop" sin indicar categoria, asi que siempre se veia el
   catalogo completo en vez de la categoria concreta.
2. La tarjeta que decia "Softshells" ahora se llama "Cazadoras", porque en
   tu tienda no existe una categoria exclusiva de softshells: estan
   agrupados junto con chaquetas, parkas, chubasqueros y cortavientos bajo
   "Cazadoras y Parkas". El nuevo titulo refleja mejor a donde lleva.

Uso: colocar este archivo en la raiz del repo (fresh-start-app) y ejecutar:
    python3 fix_enlaces_categorias_home.py

(Si ya ejecutaste una version anterior de este mismo script que dejo el
titulo como "Softshells", este vuelve a ejecutarse sin problema y solo
aplica el cambio de titulo que falte.)
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
        text = text.replace(old, new)
        print(f"OK: aplicado en {relpath} -> {desc}")
    if text != original:
        path.write_text(text, encoding="utf-8")
    else:
        print(f"(sin cambios en {relpath})")


edit_file(
    "src/routes/index.tsx",
    [
        (
            'const CATEGORIES = [\n'
            '  { label: "Camisetas", img: "/camiseta.jpg" },\n'
            '  { label: "Sudaderas", img: "/sudadera.png" },\n'
            '  { label: "Polos", img: "/polo.png" },\n'
            '  { label: "Softshells", img: "/softshell.jpg" },\n'
            '];',
            'const CATEGORIES = [\n'
            '  { label: "Camisetas", img: "/camiseta.jpg", categoryKey: "camisetas" },\n'
            '  { label: "Sudaderas", img: "/sudadera.png", categoryKey: "sudaderas" },\n'
            '  { label: "Polos", img: "/polo.png", categoryKey: "polos" },\n'
            '  { label: "Cazadoras", img: "/softshell.jpg", categoryKey: "cazadoras-parkas" },\n'
            '];',
            "añadir la categoria real de cada tarjeta y renombrar Softshells a Cazadoras",
        ),
        (
            # Por si ya se habia aplicado una version anterior de este script
            # (con categoryKey pero todavia con el titulo "Softshells").
            '  { label: "Softshells", img: "/softshell.jpg", categoryKey: "cazadoras-parkas" },',
            '  { label: "Cazadoras", img: "/softshell.jpg", categoryKey: "cazadoras-parkas" },',
            "renombrar el titulo de la tarjeta Softshells a Cazadoras",
        ),
        (
            '              <Link\n'
            '                key={c.label}\n'
            '                to="/shop"\n'
            '                className="group flex flex-col overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lg"\n'
            '              >',
            '              <Link\n'
            '                key={c.label}\n'
            '                to="/shop"\n'
            '                search={{ category: c.categoryKey }}\n'
            '                className="group flex flex-col overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lg"\n'
            '              >',
            "hacer que cada tarjeta enlace a su categoria",
        ),
    ],
)

print("\nListo. Revisa los mensajes de arriba: si todo dice 'OK: aplicado' (o al menos")
print("uno de los dos primeros pasos, segun si ya habias corrido una version previa),")
print("reinicia el servidor (pkill -f vite && npm run dev) y haz Ctrl+Shift+R en el navegador.")
