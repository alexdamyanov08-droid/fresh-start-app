"""
Migracion: mostrar la foto del modelo (persona con la prenda) en el catalogo.
Ejecutar desde la raiz del proyecto: python3 add_model_images_catalog.py

IMPORTANTE: antes de ejecutar esto, asegurate de haber colocado el archivo
src/data/model-images.ts (te lo he dado aparte) en esa ruta exacta.
"""
import os

def replace_or_warn(path, old, new, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if old not in content:
        print(f"AVISO NO ENCONTRADO en {path}: {label}")
        print("   -> Este paso NO se aplico. Pega este aviso a Claude.")
        return False
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK {path}: {label}")
    return True


if not os.path.exists("src/data/model-images.ts"):
    print("AVISO: no encuentro src/data/model-images.ts todavia.")
    print("Sube ese archivo primero a esa ruta exacta y vuelve a ejecutar este script.")
else:
    # 1) Importar el nuevo archivo en ProductCard.tsx
    replace_or_warn(
        "src/components/catalog/ProductCard.tsx",
        'import { useI18n } from "@/lib/i18n";',
        'import { useI18n } from "@/lib/i18n";\nimport { MODEL_IMAGES } from "@/data/model-images";',
        "importar MODEL_IMAGES en ProductCard",
    )

    # 2) Usar la foto del modelo si existe, si no la vista plana de siempre
    replace_or_warn(
        "src/components/catalog/ProductCard.tsx",
        "src={primary.image}",
        "src={MODEL_IMAGES[p.code] ?? primary.image}",
        "mostrar foto de modelo en el catalogo (con respaldo a la vista plana)",
    )

    print()
    print("Listo. Revisa arriba si hay algun AVISO NO ENCONTRADO.")
    print("Si todo OK, haz: git add -A && git commit -m 'Mostrar foto de modelo en el catalogo' && git push")
