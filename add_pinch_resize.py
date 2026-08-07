"""
Migracion: redimensionar logo/texto con pellizco de 2 dedos (movil) y tirador (ordenador).
Ejecutar desde la raiz del proyecto: python3 add_pinch_resize.py
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


# 1) Anadir la logica de pellizco (movil) y tirador (ordenador)
replace_or_warn(
    "src/components/customizer/Viewer.tsx",
    '  const onElementPointerDown = (e: React.PointerEvent, el: DesignElement) => {\n'
    '    e.preventDefault();\n'
    '    e.stopPropagation();\n'
    '    props.setSelectedId(el.id);\n'
    '    (e.target as HTMLElement).setPointerCapture(e.pointerId);\n'
    '    dragRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, startPos: el.pos };\n'
    '  };\n'
    '  const onPointerMove = (e: React.PointerEvent) => {\n'
    '    if (!dragRef.current || !canvasRef.current) return;\n'
    '    const el = props.elements.find((x) => x.id === dragRef.current!.id);\n'
    '    if (!el) return;\n'
    '    const rect = canvasRef.current.getBoundingClientRect();\n'
    '    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;\n'
    '    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;\n'
    '    props.updateElement(el.id, {\n'
    '      pos: {\n'
    '        x: clamp(el, dragRef.current.startPos.x + dx),\n'
    '        y: clamp(el, dragRef.current.startPos.y + dy),\n'
    '      },\n'
    '    });\n'
    '  };\n'
    '  const onPointerUp = () => { dragRef.current = null; };\n'
    '  const onBackgroundPointerDown = (e: React.PointerEvent) => {\n'
    '    if (e.target === canvasRef.current) props.setSelectedId(null);\n'
    '  };',
    '  const onElementPointerDown = (e: React.PointerEvent, el: DesignElement) => {\n'
    '    e.preventDefault();\n'
    '    e.stopPropagation();\n'
    '    props.setSelectedId(el.id);\n'
    '    (e.target as HTMLElement).setPointerCapture(e.pointerId);\n'
    '    dragRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, startPos: el.pos };\n'
    '  };\n'
    '  const resizeRef = useRef<{ id: string; startX: number; startY: number; startSize: number } | null>(null);\n'
    '  const pinchRef = useRef<{ id: string; startDist: number; startSize: number } | null>(null);\n'
    '  const onResizeHandlePointerDown = (e: React.PointerEvent, el: DesignElement) => {\n'
    '    e.preventDefault();\n'
    '    e.stopPropagation();\n'
    '    (e.target as HTMLElement).setPointerCapture(e.pointerId);\n'
    '    resizeRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, startSize: el.size };\n'
    '  };\n'
    '  const onElementTouchStart = (e: React.TouchEvent, el: DesignElement) => {\n'
    '    if (e.touches.length === 2) {\n'
    '      e.stopPropagation();\n'
    '      dragRef.current = null;\n'
    '      const t1 = e.touches[0];\n'
    '      const t2 = e.touches[1];\n'
    '      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);\n'
    '      pinchRef.current = { id: el.id, startDist: dist, startSize: el.size };\n'
    '    }\n'
    '  };\n'
    '  const onElementTouchMove = (e: React.TouchEvent) => {\n'
    '    if (!pinchRef.current || e.touches.length !== 2) return;\n'
    '    e.preventDefault();\n'
    '    const el = props.elements.find((x) => x.id === pinchRef.current!.id);\n'
    '    if (!el) return;\n'
    '    const t1 = e.touches[0];\n'
    '    const t2 = e.touches[1];\n'
    '    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);\n'
    '    const ratio = dist / pinchRef.current.startDist;\n'
    '    props.updateElement(el.id, { size: Math.min(60, Math.max(10, pinchRef.current.startSize * ratio)) });\n'
    '  };\n'
    '  const onElementTouchEnd = () => { pinchRef.current = null; };\n'
    '  const onPointerMove = (e: React.PointerEvent) => {\n'
    '    if (resizeRef.current) {\n'
    '      const el = props.elements.find((x) => x.id === resizeRef.current!.id);\n'
    '      if (el) {\n'
    '        const delta = (e.clientX - resizeRef.current.startX) + (e.clientY - resizeRef.current.startY);\n'
    '        props.updateElement(el.id, { size: Math.min(60, Math.max(10, resizeRef.current.startSize + delta * 0.2)) });\n'
    '      }\n'
    '      return;\n'
    '    }\n'
    '    if (!dragRef.current || !canvasRef.current) return;\n'
    '    const el = props.elements.find((x) => x.id === dragRef.current!.id);\n'
    '    if (!el) return;\n'
    '    const rect = canvasRef.current.getBoundingClientRect();\n'
    '    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;\n'
    '    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;\n'
    '    props.updateElement(el.id, {\n'
    '      pos: {\n'
    '        x: clamp(el, dragRef.current.startPos.x + dx),\n'
    '        y: clamp(el, dragRef.current.startPos.y + dy),\n'
    '      },\n'
    '    });\n'
    '  };\n'
    '  const onPointerUp = () => { dragRef.current = null; resizeRef.current = null; };\n'
    '  const onBackgroundPointerDown = (e: React.PointerEvent) => {\n'
    '    if (e.target === canvasRef.current) props.setSelectedId(null);\n'
    '  };',
    "anadir logica de pellizco (pinch) y tirador de redimensionado",
)

# 2) Enganchar los eventos tactiles y el estilo touch-action en el elemento
replace_or_warn(
    "src/components/customizer/Viewer.tsx",
    '                <div\n'
    '                  key={el.id}\n'
    '                  onPointerDown={(e) => onElementPointerDown(e, el)}\n'
    '                  className={`absolute flex cursor-move items-center justify-center rounded-md ${\n'
    '                    isSelected ? "outline outline-2 outline-dashed outline-foreground/60" : ""\n'
    '                  }`}\n'
    '                  style={{\n'
    '                    left: `calc(50% + ${el.pos.x}%)`,\n'
    '                    top: `calc(50% + ${el.pos.y}%)`,\n'
    '                    width: el.kind === "image" ? `${el.size}%` : undefined,\n'
    '                    padding: isSelected ? "6px" : undefined,\n'
    '                    transform: "translate(-50%, -50%)",\n'
    '                  }}\n'
    '                >',
    '                <div\n'
    '                  key={el.id}\n'
    '                  onPointerDown={(e) => onElementPointerDown(e, el)}\n'
    '                  onTouchStart={(e) => onElementTouchStart(e, el)}\n'
    '                  onTouchMove={onElementTouchMove}\n'
    '                  onTouchEnd={onElementTouchEnd}\n'
    '                  className={`absolute flex cursor-move items-center justify-center rounded-md ${\n'
    '                    isSelected ? "outline outline-2 outline-dashed outline-foreground/60" : ""\n'
    '                  }`}\n'
    '                  style={{\n'
    '                    left: `calc(50% + ${el.pos.x}%)`,\n'
    '                    top: `calc(50% + ${el.pos.y}%)`,\n'
    '                    width: el.kind === "image" ? `${el.size}%` : undefined,\n'
    '                    padding: isSelected ? "6px" : undefined,\n'
    '                    transform: "translate(-50%, -50%)",\n'
    '                    touchAction: "none",\n'
    '                  }}\n'
    '                >',
    "activar gestos tactiles y desactivar el zoom del navegador sobre el elemento",
)

# 3) Anadir el tiron (handle) visual junto al boton de borrar
replace_or_warn(
    "src/components/customizer/Viewer.tsx",
    '                  {isSelected && (\n'
    '                    <button\n'
    '                      onPointerDown={(e) => e.stopPropagation()}\n'
    '                      onClick={() => props.removeElement(el.id)}\n'
    '                      className="absolute -right-3 -top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-background shadow-sm"\n'
    '                      aria-label={t("remove_element")}\n'
    '                    >\n'
    '                      <X className="h-3.5 w-3.5" />\n'
    '                    </button>\n'
    '                  )}',
    '                  {isSelected && (\n'
    '                    <button\n'
    '                      onPointerDown={(e) => e.stopPropagation()}\n'
    '                      onClick={() => props.removeElement(el.id)}\n'
    '                      className="absolute -right-3 -top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-background shadow-sm"\n'
    '                      aria-label={t("remove_element")}\n'
    '                    >\n'
    '                      <X className="h-3.5 w-3.5" />\n'
    '                    </button>\n'
    '                  )}\n'
    '                  {isSelected && (\n'
    '                    <button\n'
    '                      onPointerDown={(e) => onResizeHandlePointerDown(e, el)}\n'
    '                      className="absolute -bottom-3 -right-3 grid h-6 w-6 cursor-nwse-resize place-items-center rounded-full border border-border bg-background text-xs shadow-sm"\n'
    '                      aria-label="Redimensionar"\n'
    '                    >\n'
    '                      \u2924\n'
    '                    </button>\n'
    '                  )}',
    "anadir el tiron visual para redimensionar con el raton",
)

print()
print("Listo. Revisa arriba si hay algun AVISO NO ENCONTRADO.")
print("Si todo OK, haz: git add -A && git commit -m 'Redimensionar logo/texto con pellizco y tiron' && git push")
