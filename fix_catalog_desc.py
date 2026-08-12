path = "src/components/catalog/ProductCard.tsx"
old = '          <p className="line-clamp-1 text-xs text-muted-foreground">{tr(p.category)}</p>'
new = '          <p className="line-clamp-1 text-xs text-muted-foreground">{p.desc}</p>'

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: catálogo ahora muestra la descripción")
else:
    print("AVISO NO ENCONTRADO")
