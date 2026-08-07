import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Sparkles, X } from "lucide-react";
import type { ColorVariant } from "@/data/products";
import type { DesignElement } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";
import { getViewImage } from "@/lib/product-views";

export type View = "front" | "back" | "left" | "right";
export type Overlay = { x: number; y: number };

export function Viewer(props: {
  productCode: string;
  color: ColorVariant;
  view: View;
  setView: (v: View) => void;
  elements: DesignElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  updateElement: (id: string, patch: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
}) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [detail, setDetail] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; startPos: Overlay } | null>(null);

  const views: View[] = ["front", "back", "left", "right"];
  const viewLabels: Record<View, "view_front" | "view_back" | "view_left" | "view_right"> = {
    front: "view_front", back: "view_back", left: "view_left", right: "view_right",
  };

  const halfSize = (el: DesignElement) => (el.kind === "image" ? el.size / 2 : 10);
  const clamp = (el: DesignElement, v: number) => Math.max(-45 + halfSize(el), Math.min(45 - halfSize(el), v));

  const selected = props.elements.find((el) => el.id === props.selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1;
      if (e.key === "ArrowLeft") props.updateElement(selected.id, { pos: { x: clamp(selected, selected.pos.x - step), y: selected.pos.y } });
      else if (e.key === "ArrowRight") props.updateElement(selected.id, { pos: { x: clamp(selected, selected.pos.x + step), y: selected.pos.y } });
      else if (e.key === "ArrowUp") props.updateElement(selected.id, { pos: { x: selected.pos.x, y: clamp(selected, selected.pos.y - step) } });
      else if (e.key === "ArrowDown") props.updateElement(selected.id, { pos: { x: selected.pos.x, y: clamp(selected, selected.pos.y + step) } });
      else if (e.key === "Delete" || e.key === "Backspace") props.removeElement(selected.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onElementPointerDown = (e: React.PointerEvent, el: DesignElement) => {
    e.preventDefault();
    e.stopPropagation();
    props.setSelectedId(el.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, startPos: el.pos };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const el = props.elements.find((x) => x.id === dragRef.current!.id);
    if (!el) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    props.updateElement(el.id, {
      pos: {
        x: clamp(el, dragRef.current.startPos.x + dx),
        y: clamp(el, dragRef.current.startPos.y + dy),
      },
    });
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (e.target === canvasRef.current) props.setSelectedId(null);
  };

  const fontClass = (font: string | null) =>
    font === "brutal" ? "font-display" :
    font === "sans" ? "font-sans" :
    font === "mono" ? "font-mono" :
    font === "serif" ? "font-serif" :
    font === "script" ? "font-script" :
    font === "condensed" ? "font-condensed" :
    font === "varsity" ? "font-varsity" :
    font === "graffiti" ? "font-graffiti" :
    font === "stencil" ? "font-stencil" :
    font === "calligraphy" ? "font-calligraphy" :
    font === "serif_thin" ? "font-serif-thin" :
    font === "casual" ? "font-casual" :
    font === "fun" ? "font-fun" :
    font === "futuristic" ? "font-futuristic" :
    font === "retro" ? "font-retro" :
    font === "gothic" ? "font-gothic" :
    font === "horror" ? "font-horror" :
    font === "comic" ? "font-comic" :
    font === "cartoon" ? "font-cartoon" :
    font === "western" ? "font-western" :
    font === "neon" ? "font-neon" :
    font === "wedding" ? "font-wedding" :
    font === "military" ? "font-military" :
    font === "kids" ? "font-kids" :
    font === "vintage" ? "font-vintage" :
    font === "sketch" ? "font-sketch" :
    font === "typewriter" ? "font-typewriter" :
    font === "luxury" ? "font-luxury" :
    font === "street" ? "font-street" :
    font === "blood" ? "font-blood" :
    font === "pixel" ? "font-pixel" :
    font === "chalk" ? "font-chalk" :
    font === "brush" ? "font-brush" :
    font === "rugby" ? "font-rugby" :
    font === "refined" ? "font-refined" :
    font === "note" ? "font-note" :
    font === "circus" ? "font-circus" :
    font === "spooky" ? "font-spooky" :
    font === "metal" ? "font-metal" :
    font === "artdeco" ? "font-artdeco" :
    font === "techno" ? "font-techno" :
    font === "candy" ? "font-candy" :
    font === "formal" ? "font-formal" :
    font === "surf" ? "font-surf" :
    font === "royal" ? "font-royal" :
    font === "italic" ? "font-sans" : // compatibilidad con diseños antiguos
    "font-display";

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      <div
        ref={canvasRef}
        onPointerDown={onBackgroundPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border grain-overlay"
        style={{ backgroundColor: `color-mix(in oklab, ${props.color.hex} 15%, var(--cream))`, touchAction: "none" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={props.color.hex + props.view}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: zoom, rotate: rot }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative flex h-full w-full items-center justify-center"
          >
            {props.color.image ? (
              <img
                src={getViewImage(props.productCode, props.color.image, props.view) ?? props.color.image}
                alt=""
                draggable={false}
                className={`max-h-full max-w-full select-none object-contain mix-blend-multiply ${detail ? "scale-125" : ""}`}
              />
            ) : (
              <div className="h-3/4 w-3/4 rounded-xl" style={{ backgroundColor: props.color.hex }} />
            )}

            {/* Design elements for this view */}
            {props.elements.map((el) => {
              const isSelected = el.id === props.selectedId;
              const textPx = el.size * 1.8;
              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => onElementPointerDown(e, el)}
                  className={`absolute flex cursor-move items-center justify-center rounded-md ${
                    isSelected ? "outline outline-2 outline-dashed outline-foreground/60" : ""
                  }`}
                  style={{
                    left: `calc(50% + ${el.pos.x}%)`,
                    top: `calc(50% + ${el.pos.y}%)`,
                    width: el.kind === "image" ? `${el.size}%` : undefined,
                    padding: isSelected ? "6px" : undefined,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {el.kind === "image" && el.image && (
                    <img
                      src={el.image}
                      alt=""
                      draggable={false}
                      className="pointer-events-none w-full select-none object-contain drop-shadow-md"
                    />
                  )}
                  {el.kind === "text" && (
                    <span
                      className={`${fontClass(el.font)} ${el.bold ? "font-black" : ""} ${el.italic ? "italic" : ""} pointer-events-none select-none uppercase tracking-tight`}
                      style={{
                        fontSize: `${textPx}px`,
                        lineHeight: 1,
                        color: el.color ?? "#0a0a0a",
                        textShadow: `0 0 1px ${contrastStroke(el.color ?? "#0a0a0a", props.color.hex)}, 0 1px 2px rgba(0,0,0,0.15)`,
                      }}
                    >
                      {el.text || " "}
                    </span>
                  )}
                  {isSelected && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => props.removeElement(el.id)}
                      className="absolute -right-3 -top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-background shadow-sm"
                      aria-label={t("remove_element")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Floating status badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: props.color.hex }} />
          {props.color.name} · {t(viewLabels[props.view])}
        </div>

        {/* Overlay controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5">
          <IconBtn onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))} label={t("zoom_in")}><ZoomIn className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))} label={t("zoom_out")}><ZoomOut className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setRot((r) => r - 15)} label={t("rotate_l")}><RotateCcw className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setRot((r) => r + 15)} label={t("rotate_r")}><RotateCw className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setDetail((d) => !d)} label={t("fabric_detail")} active={detail}><Sparkles className="h-4 w-4" /></IconBtn>
        </div>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-2">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => { props.setView(v); props.setSelectedId(null); }}
            aria-pressed={props.view === v}
            className={`flex-1 rounded-full border px-3 py-2 font-display text-xs uppercase tracking-wider transition ${
              props.view === v
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:border-foreground"
            }`}
          >
            {t(viewLabels[v])}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, label, active }: { children: React.ReactNode; onClick: () => void; label: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition ${
        active ? "border-foreground bg-foreground text-background" : "border-border bg-background/90 hover:border-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// naive luminance check for contrast stroke
function contrastStroke(fg: string, bg: string) {
  const lum = (hex: string) => {
    const h = hex.replace("#", "");
    if (h.length !== 6) return 0.5;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  return Math.abs(lum(fg) - lum(bg)) < 0.3 ? (lum(bg) > 0.5 ? "#000" : "#fff") : "transparent";
}