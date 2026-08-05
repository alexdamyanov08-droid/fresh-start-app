"""
Migración: añadir selector de color libre (paleta completa) para el texto.
Ejecutar desde la raíz del proyecto: python3 add_custom_color_picker.py
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


replace_or_warn(
    "src/components/customizer/ControlPanel.tsx",
    '{textColors.map((c) => (\n'
    '                    <button\n'
    '                      key={c}\n'
    '                      onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { color: c }); }}\n'
    '                      aria-label={c}\n'
    '                      aria-pressed={el.color === c}\n'
    '                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${\n'
    '                        el.color === c ? "border-foreground scale-110" : "border-border"\n'
    '                      }`}\n'
    '                    >\n'
    '                      <span className="h-6 w-6 rounded-full border border-border/50" style={{ backgroundColor: c }} />\n'
    '                    </button>\n'
    '                  ))}\n'
    '                </div>\n'
    '              </div>\n'
    '\n'
    '              <div>\n'
    '                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">\n'
    '                  <span>{t("text_size")}</span>',
    '{textColors.map((c) => (\n'
    '                    <button\n'
    '                      key={c}\n'
    '                      onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { color: c }); }}\n'
    '                      aria-label={c}\n'
    '                      aria-pressed={el.color === c}\n'
    '                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${\n'
    '                        el.color === c ? "border-foreground scale-110" : "border-border"\n'
    '                      }`}\n'
    '                    >\n'
    '                      <span className="h-6 w-6 rounded-full border border-border/50" style={{ backgroundColor: c }} />\n'
    '                    </button>\n'
    '                  ))}\n'
    '                  <label\n'
    '                    className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-border cursor-pointer transition hover:border-foreground"\n'
    '                    title="Elegir cualquier color"\n'
    '                    onClick={(e) => e.stopPropagation()}\n'
    '                  >\n'
    '                    <input\n'
    '                      type="color"\n'
    '                      value={el.color ?? "#0a0a0a"}\n'
    '                      onChange={(e) => props.updateElement(el.id, { color: e.target.value })}\n'
    '                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"\n'
    '                    />\n'
    '                    <span\n'
    '                      className="h-6 w-6 rounded-full border border-border/50"\n'
    '                      style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}\n'
    '                    />\n'
    '                  </label>\n'
    '                </div>\n'
    '              </div>\n'
    '\n'
    '              <div>\n'
    '                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-widest">\n'
    '                  <span>{t("text_size")}</span>',
    "añadir selector de color libre (círculo arcoíris) junto a los 6 colores rápidos",
)

print("\nListo. Revisa arriba si hay algún ⚠️ NO ENCONTRADO.")
print("Si sale ✅, haz: git add -A && git commit -m 'Añadir selector de color libre para el texto' && git push")
