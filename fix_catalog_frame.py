path = "src/components/catalog/ProductCard.tsx"
old = '          style={{ backgroundColor: primary?.hex ? `${primary.hex}22` : "var(--cream)" }}'
new = '          style={{ backgroundColor: "#ffffff" }}'

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: marco puesto en blanco")
else:
    print("AVISO NO ENCONTRADO")
