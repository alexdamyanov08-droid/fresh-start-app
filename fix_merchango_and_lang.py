# Script para:
# 1) Cambiar el idioma por defecto de la web de ingles a espanol (si el visitante
#    no habia elegido idioma antes).
# 2) Sustituir todas las apariciones de "Merchango" (nombre de la plantilla original)
#    por "Xprint Wear" en toda la web.
import os

FILES = [
    "src/lib/i18n.tsx",
    "src/routes/__root.tsx",
    "src/routes/about.tsx",
    "src/routes/account.tsx",
    "src/routes/auth.tsx",
    "src/routes/checkout.tsx",
    "src/routes/drop.tsx",
    "src/routes/product.$code.tsx",
    "src/routes/reset-password.tsx",
    "src/routes/shop.tsx",
    "src/routes/thanks.tsx",
]

total_replacements = 0
missing_files = []

for f in FILES:
    if not os.path.exists(f):
        missing_files.append(f)
        continue
    with open(f, "r", encoding="utf-8") as fh:
        content = fh.read()
    count = content.count("Merchango")
    if count:
        content = content.replace("Merchango", "Xprint Wear")
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
    total_replacements += count
    print(f"{f}: {count} reemplazos")

if missing_files:
    print("AVISO: no se encontraron estos archivos (se omiten):", missing_files)

# Cambiar idioma por defecto
i18n_path = "src/lib/i18n.tsx"
if os.path.exists(i18n_path):
    with open(i18n_path, "r", encoding="utf-8") as fh:
        content = fh.read()
    old = 'const [lang, setLang] = useState<Lang>("en");'
    new = 'const [lang, setLang] = useState<Lang>("es");'
    if old in content:
        content = content.replace(old, new)
        with open(i18n_path, "w", encoding="utf-8") as fh:
            fh.write(content)
        print("Idioma por defecto cambiado a español: OK")
    elif new in content:
        print("Idioma por defecto ya estaba en español: OK (sin cambios)")
    else:
        print("AVISO: no se encontro la linea del idioma por defecto para cambiar, revisar a mano")

print(f"\nTOTAL reemplazos de 'Merchango' -> 'Xprint Wear': {total_replacements}")
