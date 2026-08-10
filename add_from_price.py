"""
Migracion: mostrar "Desde X€ Nino / Desde Y€ Adulto" en vez de 0.00€ cuando
todavia no se ha elegido ninguna unidad.
Ejecutar desde la raiz del proyecto: python3 add_from_price.py
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


# 1) sizes.ts - anadir la funcion que detecta si una talla es de nino/bebe
replace_or_warn(
    "src/lib/sizes.ts",
    'export function sortSizes(sizes: string[]): string[] {',
    '/** Indica si una talla es de nino/bebe (meses, anos, rangos infantiles tipo\n'
    ' *  "5/6", o numeros bajos de edad), a diferencia de las de adulto (S-5XL, 36-52...). */\n'
    'export function isKidSize(raw: string): boolean {\n'
    '  const s = raw.trim().toUpperCase();\n'
    '  if (/^\\d+\\s*MESES?$/.test(s)) return true;\n'
    '  if (/^\\d+\\s*A[\u00d1N]OS?$/.test(s)) return true;\n'
    '  if (/^(\\d+)\\/(\\d+)$/.test(s)) return true;\n'
    '  const m = s.match(/^(\\d+)$/);\n'
    '  if (m) return parseInt(m[1], 10) < 18;\n'
    '  if (s.startsWith("KID") || s.startsWith("JR")) return true;\n'
    '  return false;\n'
    '}\n'
    'export function sortSizes(sizes: string[]): string[] {',
    "anadir isKidSize() para distinguir tallas de nino/adulto",
)

# 2) product.$code.tsx - importar isKidSize y anadir la funcion auxiliar de precio minimo
replace_or_warn(
    "src/routes/product.$code.tsx",
    'import { basePriceForVariant, surchargeOf } from "@/lib/pricing";',
    'import { basePriceForVariant, surchargeOf } from "@/lib/pricing";\n'
    'import { isKidSize } from "@/lib/sizes";\n'
    '// Precio minimo (tramo 1-10 uds) para nino y para adulto, del color elegido.\n'
    '// Se usan para el "Desde X€" cuando todavia no se ha elegido ninguna unidad.\n'
    'function lowestTierPrice(sizesList: string[], forKid: boolean, prod: any, colorName: string): number | null {\n'
    '  const prices = sizesList\n'
    '    .filter((s) => isKidSize(s) === forKid)\n'
    '    .map((s) => getVariant(prod, s, colorName)?.tiers?.t1_10)\n'
    '    .filter((n): n is number => typeof n === "number");\n'
    '  return prices.length ? Math.min(...prices) : null;\n'
    '}',
    "importar isKidSize y anadir la funcion auxiliar de precio minimo",
)

# 3) product.$code.tsx - calcular fromPriceKid / fromPriceAdult
replace_or_warn(
    "src/routes/product.$code.tsx",
    '    return Array.from(map.values()).map((g) => ({\n'
    '      label: g.sizes.length > 3 ? `${g.sizes[0]}\u2013${g.sizes[g.sizes.length - 1]}` : g.sizes.join(", "),\n'
    '      tiers: g.tiers,\n'
    '    }));\n'
    '  }, [p, color.name]);',
    '    return Array.from(map.values()).map((g) => ({\n'
    '      label: g.sizes.length > 3 ? `${g.sizes[0]}\u2013${g.sizes[g.sizes.length - 1]}` : g.sizes.join(", "),\n'
    '      tiers: g.tiers,\n'
    '    }));\n'
    '  }, [p, color.name]);\n'
    '  const fromPriceKid = useMemo(\n'
    '    () => lowestTierPrice(p.sizes, true, p, color.name),\n'
    '    [p, color.name],\n'
    '  );\n'
    '  const fromPriceAdult = useMemo(\n'
    '    () => lowestTierPrice(p.sizes, false, p, color.name),\n'
    '    [p, color.name],\n'
    '  );',
    "calcular los precios minimos de nino y de adulto",
)

# 4) product.$code.tsx - pasar los precios 'desde' al panel de control
replace_or_warn(
    "src/routes/product.$code.tsx",
    '        <ControlPanel\n'
    '          product={p}',
    '        <ControlPanel\n'
    '          fromPriceKid={fromPriceKid}\n'
    '          fromPriceAdult={fromPriceAdult}\n'
    '          product={p}',
    "pasar los precios 'desde' al panel de control",
)

# 5) ControlPanel.tsx - aceptar los nuevos props
replace_or_warn(
    "src/components/customizer/ControlPanel.tsx",
    "  totalPrice: number;",
    "  totalPrice: number;\n"
    "  fromPriceKid?: number | null;\n"
    "  fromPriceAdult?: number | null;",
    "anadir fromPriceKid / fromPriceAdult al tipo de props",
)

# 6) ControlPanel.tsx - mostrar "Desde X€" en vez de 0.00€
replace_or_warn(
    "src/components/customizer/ControlPanel.tsx",
    '        <p className="mt-2 text-2xl font-semibold">\u20ac{props.totalPrice.toFixed(2)}</p>',
    '        {props.totalPrice > 0 ? (\n'
    '          <p className="mt-2 text-2xl font-semibold">\u20ac{props.totalPrice.toFixed(2)}</p>\n'
    '        ) : props.fromPriceKid != null || props.fromPriceAdult != null ? (\n'
    '          <div className="mt-2 flex flex-col gap-0.5">\n'
    '            {props.fromPriceKid != null && (\n'
    '              <p className="text-lg font-semibold">\n'
    '                Desde \u20ac{props.fromPriceKid.toFixed(2)}{" "}\n'
    '                <span className="text-sm font-normal text-muted-foreground">Ni\u00f1o</span>\n'
    '              </p>\n'
    '            )}\n'
    '            {props.fromPriceAdult != null && (\n'
    '              <p className="text-lg font-semibold">\n'
    '                Desde \u20ac{props.fromPriceAdult.toFixed(2)}{" "}\n'
    '                <span className="text-sm font-normal text-muted-foreground">Adulto</span>\n'
    '              </p>\n'
    '            )}\n'
    '          </div>\n'
    '        ) : (\n'
    '          <p className="mt-2 text-2xl font-semibold">\u20ac{props.totalPrice.toFixed(2)}</p>\n'
    '        )}',
    "mostrar 'Desde X\u20ac Ni\u00f1o / Adulto' en vez de 0.00\u20ac",
)

print()
print("Listo. Revisa arriba si hay algun AVISO NO ENCONTRADO.")
print("Si todo OK, haz: git add -A && git commit -m 'Mostrar Desde X€ en vez de 0.00€' && git push")
