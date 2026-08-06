"""
Migración: cambiar las vistas de producto (espalda/lados) de Supabase a Cloudflare R2.
Ejecutar desde la raíz del proyecto: python3 migrate_images_to_r2.py
"""

def replace_or_warn(path, old, new, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if old not in content:
        print(f"⚠️  NO ENCONTRADO en {path}: {label}")
        print("   -> Este paso NO se aplicó. Pega este aviso a Claude.")
        return False
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ {path}: {label}")
    return True


# 1) Cambiar la URL base y el bucket por la URL pública de Cloudflare R2
replace_or_warn(
    "src/lib/product-views.ts",
    'const SUPABASE_URL = "https://kskrofewwnurmqiqzjtz.supabase.co";\n'
    'const BUCKET = "vistas-productos";',
    'const R2_PUBLIC_URL = "https://pub-597cce2a5bf94f1193f57972dd27c3fc.r2.dev";',
    "sustituir la URL de Supabase por la de Cloudflare R2",
)

# 2) Cambiar cómo se construye la URL final de la imagen
replace_or_warn(
    "src/lib/product-views.ts",
    'return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;',
    'return `${R2_PUBLIC_URL}/${filename}`;',
    "construir la URL final apuntando a Cloudflare en vez de Supabase",
)

print("\nListo. Revisa arriba si hay algún ⚠️ NO ENCONTRADO.")
print("Si sale ✅, haz: git add -A && git commit -m 'Migrar vistas de producto a Cloudflare R2' && git push")
