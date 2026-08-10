"""
Migracion: mostrar "Desde X€ Nino · Desde Y€ Adulto" en las tarjetas del catalogo,
en vez del precio fijo unico.
Ejecutar desde la raiz del proyecto: python3 add_from_price_catalog.py
"""

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


# 1) Importar getVariant e isKidSize
replace_or_warn(
    "src/components/catalog/ProductCard.tsx",
    'import type { Product } from "@/data/products";\n'
    'import { useI18n } from "@/lib/i18n";\n'
    'import { MODEL_IMAGES } from "@/data/model-images";',
    'import type { Product } from "@/data/products";\n'
    'import { getVariant } from "@/data/products";\n'
    'import { useI18n } from "@/lib/i18n";\n'
    'import { MODEL_IMAGES } from "@/data/model-images";\n'
    'import { isKidSize } from "@/lib/sizes";',
    "importar getVariant e isKidSize en ProductCard",
)

# 2) Calcular los precios minimos de nino/adulto para este producto
replace_or_warn(
    "src/components/catalog/ProductCard.tsx",
    '  const primary = p.colors.find((c) => c.image) ?? p.colors[0];',
    '  const primary = p.colors.find((c) => c.image) ?? p.colors[0];\n'
    '  const colorNameForPrice = primary?.name ?? "";\n'
    '  const fromPriceKid = (() => {\n'
    '    const prices = p.sizes\n'
    '      .filter((s) => isKidSize(s))\n'
    '      .map((s) => getVariant(p, s, colorNameForPrice)?.tiers?.t1_10)\n'
    '      .filter((n): n is number => typeof n === "number");\n'
    '    return prices.length ? Math.min(...prices) : null;\n'
    '  })();\n'
    '  const fromPriceAdult = (() => {\n'
    '    const prices = p.sizes\n'
    '      .filter((s) => !isKidSize(s))\n'
    '      .map((s) => getVariant(p, s, colorNameForPrice)?.tiers?.t1_10)\n'
    '      .filter((n): n is number => typeof n === "number");\n'
    '    return prices.length ? Math.min(...prices) : null;\n'
    '  })();',
    "calcular fromPriceKid / fromPriceAdult para la tarjeta",
)

# 3) Mostrar "Desde X€ Nino · Desde Y€ Adulto" en vez del precio fijo
replace_or_warn(
    "src/components/catalog/ProductCard.tsx",
    '            <span className="font-semibold">\u20ac{p.price.toFixed(2)}</span>',
    '            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">\n'
    '              {fromPriceKid != null && (\n'
    '                <span className="font-semibold">\n'
    '                  Desde \u20ac{fromPriceKid.toFixed(2)}{" "}\n'
    '                  <span className="text-xs font-normal text-muted-foreground">Ni\u00f1o</span>\n'
    '                </span>\n'
    '              )}\n'
    '              {fromPriceAdult != null && (\n'
    '                <span className="font-semibold">\n'
    '                  Desde \u20ac{fromPriceAdult.toFixed(2)}{" "}\n'
    '                  <span className="text-xs font-normal text-muted-foreground">Adulto</span>\n'
    '                </span>\n'
    '              )}\n'
    '              {fromPriceKid == null && fromPriceAdult == null && (\n'
    '                <span className="font-semibold">\u20ac{p.price.toFixed(2)}</span>\n'
    '              )}\n'
    '            </div>',
    "mostrar 'Desde X\u20ac Ni\u00f1o \u00b7 Desde Y\u20ac Adulto' en la tarjeta",
)

print()
print("Listo. Revisa arriba si hay algun AVISO NO ENCONTRADO.")
print("Si todo OK, haz: git add -A && git commit -m 'Precio Desde en tarjetas del catalogo' && git push")
