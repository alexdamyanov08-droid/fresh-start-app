import re

path = "src/routes/product.$code.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

changes = 0

# 1) addRosterEntry: validar que hay hueco disponible en esa talla antes de añadir
old1 = '''  const addRosterEntry = (name: string, number: string, sz: string) => {
    if (!name.trim()) return;
    setRoster((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), number: number.trim(), size: sz }]);
  };'''
new1 = '''  const addRosterEntry = (name: string, number: string, sz: string) => {
    if (!name.trim()) return;
    const usedForSize = roster.filter((r) => r.size === sz).length;
    const availableForSize = quantities[sz] || 0;
    if (usedForSize >= availableForSize) {
      toast.error(`Primero indica la cantidad de la talla ${sz} en la tabla de arriba`);
      return;
    }
    setRoster((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), number: number.trim(), size: sz }]);
  };'''
if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
else:
    print("AVISO: bloque 1 (addRosterEntry) no encontrado")

# 2) totalQtyAllSizes: ya no se suma roster.length (el roster no añade unidades, solo las etiqueta)
old2 = '''  const totalQtyAllSizes = Object.values(quantities).reduce((s, n) => s + (n || 0), 0) + roster.length;'''
new2 = '''  const totalQtyAllSizes = Object.values(quantities).reduce((s, n) => s + (n || 0), 0);'''
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
else:
    print("AVISO: bloque 2 (totalQtyAllSizes) no encontrado")

# 3) totalPriceAllSizes: quitar el precio extra por roster (ya está incluido en quantities)
old3 = '''  const totalPriceAllSizes =
    Object.entries(quantities).reduce((sum, [sz, n]) => {
      if (!n) return sum;
      const v = getVariant(p, sz, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      return sum + (bp + surcharge) * n;
    }, 0) +
    roster.reduce((sum, r) => {
      const v = getVariant(p, r.size, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      return sum + (bp + surcharge);
    }, 0);'''
new3 = '''  const totalPriceAllSizes =
    Object.entries(quantities).reduce((sum, [sz, n]) => {
      if (!n) return sum;
      const v = getVariant(p, sz, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      return sum + (bp + surcharge) * n;
    }, 0);'''
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
else:
    print("AVISO: bloque 3 (totalPriceAllSizes) no encontrado")

# 4) breakdown: mostrar por talla la parte genérica + la parte con nombre, sin duplicar unidades
old4 = '''  const breakdown = [
    ...Object.entries(quantities)
      .filter(([, n]) => n > 0)
      .map(([sz, n]) => {
        const v = getVariant(p, sz, color.name);
        const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
        const unit = bp + surcharge;
        return { label: sz, qty: n, unit, subtotal: unit * n };
      }),
    ...roster.map((r) => {
      const v = getVariant(p, r.size, color.name);
      const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
      const unit = bp + surcharge;
      return { label: `${r.name}${r.number ? " · " + r.number : ""} (${r.size})`, qty: 1, unit, subtotal: unit };
    }),
  ];'''
new4 = '''  const breakdown = [
    ...Object.entries(quantities)
      .filter(([, n]) => n > 0)
      .flatMap(([sz, n]) => {
        const v = getVariant(p, sz, color.name);
        const bp = v ? basePriceForVariant(v.tiers, qtyAlreadyInCartForRef + totalQtyAllSizes) : p.price;
        const unit = bp + surcharge;
        const namedForSize = roster.filter((r) => r.size === sz);
        const genericQty = n - namedForSize.length;
        const rows: { label: string; qty: number; unit: number; subtotal: number }[] = [];
        if (genericQty > 0) rows.push({ label: sz, qty: genericQty, unit, subtotal: unit * genericQty });
        for (const r of namedForSize) {
          rows.push({ label: `${r.name}${r.number ? " · " + r.number : ""} (${r.size})`, qty: 1, unit, subtotal: unit });
        }
        return rows;
      }),
  ];'''
if old4 in content:
    content = content.replace(old4, new4)
    changes += 1
else:
    print("AVISO: bloque 4 (breakdown) no encontrado")

# 5) onAdd: por cada talla, la parte sin nombre va como una linea normal,
#    y cada persona del roster va como una linea de 1 unidad personalizada.
#    El total de unidades sigue siendo el de la tabla de cantidades.
old5 = '''    const bulkEntries = Object.entries(quantities).filter(([, n]) => n > 0);
    if (bulkEntries.length === 0 && roster.length === 0) return;
    for (const [sz, n] of bulkEntries) {
      const v = getVariant(p, sz, color.name);
      add({
        code: p.code, name: p.name, image: color.image, size: sz,
        colorName: color.name, colorHex: color.hex, qty: n,
        tiers: v?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
        elements,
      });
    }
    // Una línea por amigo: mismo diseño, pero con el texto sustituido por su nombre (y número).
    for (const r of roster) {
      const v = getVariant(p, r.size, color.name);
      const personalized = elements.map((el) =>
        el.kind === "text" ? { ...el, text: `${r.name}${r.number ? " " + r.number : ""}`.toUpperCase() } : el
      );
      add({
        code: p.code, name: p.name, image: color.image, size: r.size,
        colorName: color.name, colorHex: color.hex, qty: 1,
        tiers: v?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price },
        elements: personalized,
      });
    }'''
new5 = '''    const bulkEntries = Object.entries(quantities).filter(([, n]) => n > 0);
    if (bulkEntries.length === 0) return;
    for (const [sz, n] of bulkEntries) {
      const v = getVariant(p, sz, color.name);
      const tiers = v?.tiers ?? { t1_10: p.price, t11_30: p.price, t31_100: p.price, t101_plus: p.price };
      const namedForSize = roster.filter((r) => r.size === sz);
      const genericQty = n - namedForSize.length;
      // Unidades de esta talla sin nombre asignado: una sola línea con el diseño genérico.
      if (genericQty > 0) {
        add({
          code: p.code, name: p.name, image: color.image, size: sz,
          colorName: color.name, colorHex: color.hex, qty: genericQty,
          tiers,
          elements,
        });
      }
      // Unidades de esta talla con nombre asignado: una línea de 1 unidad por persona,
      // con el texto sustituido por su nombre (y número). No suman unidades extra.
      for (const r of namedForSize) {
        const personalized = elements.map((el) =>
          el.kind === "text" ? { ...el, text: `${r.name}${r.number ? " " + r.number : ""}`.toUpperCase() } : el
        );
        add({
          code: p.code, name: p.name, image: color.image, size: r.size,
          colorName: color.name, colorHex: color.hex, qty: 1,
          tiers,
          elements: personalized,
        });
      }
    }'''
if old5 in content:
    content = content.replace(old5, new5)
    changes += 1
else:
    print("AVISO: bloque 5 (onAdd) no encontrado")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Cambios aplicados: {changes} de 5")
