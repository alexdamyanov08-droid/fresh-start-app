"""
Migración: 15 fuentes + negrita/cursiva independientes.
Ejecutar desde la raíz del proyecto: python3 add_fonts_bold_italic_v2.py
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

def insert_before_or_warn(path, anchor, new, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if anchor not in content:
        print(f"⚠️  NO ENCONTRADO en {path}: {label}")
        return False
    if new.strip() in content:
        print(f"ℹ️  Ya estaba aplicado antes: {label}")
        return True
    content = content.replace(anchor, new + anchor, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ {path}: {label}")
    return True


# 1) src/styles.css — traer las 12 fuentes nuevas de Google Fonts directamente por CSS
insert_before_or_warn(
    "src/styles.css",
    '@import "tailwindcss" source(none);',
    '@import url(\'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Caveat:wght@700&family=Bebas+Neue&family=Passion+One:wght@700&family=Permanent+Marker&family=Stardos+Stencil:wght@700&family=Alex+Brush&family=Cormorant+Garamond:wght@600&family=Shadows+Into+Light&family=Fredoka:wght@500&family=Orbitron:wght@700&family=Righteous&display=swap\');\n',
    "añadir las 12 fuentes nuevas de Google Fonts (vía CSS)",
)

# 2) src/styles.css — registrar todas las fuentes como variables de Tailwind
replace_or_warn(
    "src/styles.css",
    '  --font-display: "Archivo Black", "Anton", ui-sans-serif, sans-serif;\n'
    '  --font-sans: "Inter", ui-sans-serif, sans-serif;\n',
    '  --font-display: "Archivo Black", "Anton", ui-sans-serif, sans-serif;\n'
    '  --font-sans: "Inter", ui-sans-serif, sans-serif;\n'
    '  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;\n'
    '  --font-serif: "Playfair Display", ui-serif, Georgia, serif;\n'
    '  --font-script: "Caveat", cursive;\n'
    '  --font-condensed: "Bebas Neue", ui-sans-serif, sans-serif;\n'
    '  --font-varsity: "Passion One", ui-sans-serif, sans-serif;\n'
    '  --font-graffiti: "Permanent Marker", cursive;\n'
    '  --font-stencil: "Stardos Stencil", ui-sans-serif, sans-serif;\n'
    '  --font-calligraphy: "Alex Brush", cursive;\n'
    '  --font-serif-thin: "Cormorant Garamond", ui-serif, serif;\n'
    '  --font-casual: "Shadows Into Light", cursive;\n'
    '  --font-fun: "Fredoka", ui-sans-serif, sans-serif;\n'
    '  --font-futuristic: "Orbitron", ui-sans-serif, sans-serif;\n'
    '  --font-retro: "Righteous", ui-sans-serif, sans-serif;\n',
    "añadir variables de las 12 fuentes nuevas",
)

# 3) ControlPanel.tsx — ampliar la lista de fuentes a 15
replace_or_warn(
    "src/components/customizer/ControlPanel.tsx",
    'const fonts = [\n'
    '    { key: "brutal", label: "BRUTAL", cls: "font-display" },\n'
    '    { key: "italic", label: "Italic", cls: "font-sans font-black italic" },\n'
    '    { key: "mono", label: "MONO", cls: "font-mono font-bold" },\n'
    '  ];',
    'const fonts = [\n'
    '    { key: "brutal", label: "Brutal", cls: "font-display" },\n'
    '    { key: "sans", label: "Moderna", cls: "font-sans" },\n'
    '    { key: "mono", label: "Mono", cls: "font-mono" },\n'
    '    { key: "serif", label: "Elegante", cls: "font-serif" },\n'
    '    { key: "script", label: "Manuscrita", cls: "font-script" },\n'
    '    { key: "condensed", label: "Deportiva", cls: "font-condensed" },\n'
    '    { key: "varsity", label: "Universitaria", cls: "font-varsity" },\n'
    '    { key: "graffiti", label: "Graffiti", cls: "font-graffiti" },\n'
    '    { key: "stencil", label: "Plantilla", cls: "font-stencil" },\n'
    '    { key: "calligraphy", label: "Caligrafía", cls: "font-calligraphy" },\n'
    '    { key: "serif_thin", label: "Serif Fina", cls: "font-serif-thin" },\n'
    '    { key: "casual", label: "Casual", cls: "font-casual" },\n'
    '    { key: "fun", label: "Divertida", cls: "font-fun" },\n'
    '    { key: "futuristic", label: "Futurista", cls: "font-futuristic" },\n'
    '    { key: "retro", label: "Retro", cls: "font-retro" },\n'
    '  ];',
    "ampliar de 3 a 15 fuentes",
)

# 4) ControlPanel.tsx — grid con scroll (15 no caben en pantalla sin scroll) + botones B/I
replace_or_warn(
    "src/components/customizer/ControlPanel.tsx",
    '<p className="mb-2 text-xs uppercase tracking-widest">{t("text_font")}</p>\n'
    '                <div className="grid grid-cols-3 gap-2">\n'
    '                  {fonts.map((f) => (\n'
    '                    <button\n'
    '                      key={f.key}\n'
    '                      onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { font: f.key }); }}\n'
    '                      aria-pressed={el.font === f.key}\n'
    '                      className={`rounded-lg border py-3 text-sm uppercase transition ${f.cls} ${\n'
    '                        el.font === f.key ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"\n'
    '                      }`}\n'
    '                    >\n'
    '                      {f.label}\n'
    '                    </button>\n'
    '                  ))}\n'
    '                </div>\n'
    '              </div>\n'
    '\n'
    '              <div>',
    '<p className="mb-2 text-xs uppercase tracking-widest">{t("text_font")}</p>\n'
    '                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">\n'
    '                  {fonts.map((f) => (\n'
    '                    <button\n'
    '                      key={f.key}\n'
    '                      onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { font: f.key }); }}\n'
    '                      aria-pressed={el.font === f.key}\n'
    '                      className={`rounded-lg border py-3 text-sm uppercase transition ${f.cls} ${\n'
    '                        el.font === f.key ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"\n'
    '                      }`}\n'
    '                    >\n'
    '                      {f.label}\n'
    '                    </button>\n'
    '                  ))}\n'
    '                </div>\n'
    '                <div className="mt-2 flex gap-2">\n'
    '                  <button\n'
    '                    onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { bold: !el.bold }); }}\n'
    '                    aria-pressed={!!el.bold}\n'
    '                    className={`flex-1 rounded-lg border py-2 text-sm font-black transition ${\n'
    '                      el.bold ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"\n'
    '                    }`}\n'
    '                  >\n'
    '                    B\n'
    '                  </button>\n'
    '                  <button\n'
    '                    onClick={(e) => { e.stopPropagation(); props.updateElement(el.id, { italic: !el.italic }); }}\n'
    '                    aria-pressed={!!el.italic}\n'
    '                    className={`flex-1 rounded-lg border py-2 text-sm italic transition ${\n'
    '                      el.italic ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"\n'
    '                    }`}\n'
    '                  >\n'
    '                    I\n'
    '                  </button>\n'
    '                </div>\n'
    '              </div>\n'
    '\n'
    '              <div>',
    "añadir scroll al grid + botones de negrita (B) y cursiva (I)",
)

# 5) Viewer.tsx — traducir cada una de las 15 fuentes + compatibilidad con diseños antiguos
replace_or_warn(
    "src/components/customizer/Viewer.tsx",
    'const fontClass = (font: string | null) =>\n'
    '    font === "brutal" ? "font-display" :\n'
    '    font === "mono" ? "font-mono font-bold" : "font-sans font-black italic";',
    'const fontClass = (font: string | null) =>\n'
    '    font === "brutal" ? "font-display" :\n'
    '    font === "sans" ? "font-sans" :\n'
    '    font === "mono" ? "font-mono" :\n'
    '    font === "serif" ? "font-serif" :\n'
    '    font === "script" ? "font-script" :\n'
    '    font === "condensed" ? "font-condensed" :\n'
    '    font === "varsity" ? "font-varsity" :\n'
    '    font === "graffiti" ? "font-graffiti" :\n'
    '    font === "stencil" ? "font-stencil" :\n'
    '    font === "calligraphy" ? "font-calligraphy" :\n'
    '    font === "serif_thin" ? "font-serif-thin" :\n'
    '    font === "casual" ? "font-casual" :\n'
    '    font === "fun" ? "font-fun" :\n'
    '    font === "futuristic" ? "font-futuristic" :\n'
    '    font === "retro" ? "font-retro" :\n'
    '    font === "italic" ? "font-sans" : // compatibilidad con diseños antiguos\n'
    '    "font-display";',
    "ampliar fontClass a 15 fuentes + compatibilidad con diseños antiguos",
)

# 6) Viewer.tsx — aplicar negrita/cursiva de forma independiente al pintar el texto
replace_or_warn(
    "src/components/customizer/Viewer.tsx",
    'className={`${fontClass(el.font)} pointer-events-none select-none uppercase tracking-tight`}',
    'className={`${fontClass(el.font)} ${el.bold ? "font-black" : ""} ${el.italic ? "italic" : ""} pointer-events-none select-none uppercase tracking-tight`}',
    "aplicar negrita/cursiva independientes al dibujar el texto",
)

# 7) cart-store.tsx — el molde de datos ahora guarda bold/italic
replace_or_warn(
    "src/lib/cart-store.tsx",
    '  font?: string | null;\n'
    '  color?: string | null;',
    '  font?: string | null;\n'
    '  bold?: boolean | null;\n'
    '  italic?: boolean | null;\n'
    '  color?: string | null;',
    "guardar negrita/cursiva en cada elemento de texto",
)

print("\nListo. Revisa arriba si hay algún ⚠️ NO ENCONTRADO.")
print("Si todo tiene ✅, haz: git add -A && git commit -m 'Añadir 15 fuentes + negrita/cursiva independientes' && git push")
