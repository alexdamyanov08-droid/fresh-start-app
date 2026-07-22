import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Sparkles, Move } from "lucide-react";
import type { ColorVariant } from "@/data/products";
import { useI18n } from "@/lib/i18n";

export type View = "front" | "back" | "left" | "right";
export type Overlay = { x: number; y: number };

export function Viewer(props: {
  color: ColorVariant;
  view: View;
  setView: (v: View) => void;
  logoPos: string | null;
  logoImage: string | null;
  logoSize: number;
  customText: string;
  textColor: string;
  textFont: string;
  textSize: number;
  overlayPos: Overlay;
  setOverlayPos: (p: Overlay) => void;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [detail, setDetail] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const views: View[] = ["front", "back", "left", "right"];
  const viewLabels: Record<View, "view_front" | "view_back" | "view_left" | "view_right"> = {
    front: "view_front", back: "view_back", left: "view_left", right: "view_right",
  };

  // Printable zone: left 30%, top 22%, width 40%, height 50% → center at (50%, 47%)
  // Overlay position is expressed relative to canvas center (percent).
  // Approximate half-size of overlay in each axis to keep it fully inside the zone.
  const halfW = props.logoImage ? props.logoSize / 2 : 6;
  const halfH = props.logoImage ? props.logoSize / 2 : 6;
  const clampX = (v: number) => Math.max(-20 + halfW, Math.min(20 - halfW, v));
  const clampY = (v: number) => Math.max(-25 + halfH, Math.min(19 - halfH, v));

  useEffect(() => {
    if (!props.editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (props.view !== "front") return;
      const step = e.shiftKey ? 5 : 1;
      if (e.key === "ArrowLeft") props.setOverlayPos({ x: clampX(props.overlayPos.x - step), y: props.overlayPos.y });
      else if (e.key === "ArrowRight") props.setOverlayPos({ x: clampX(props.overlayPos.x + step), y: props.overlayPos.y });
      else if (e.key === "ArrowUp") props.setOverlayPos({ x: props.overlayPos.x, y: clampY(props.overlayPos.y - step) });
      else if (e.key === "ArrowDown") props.setOverlayPos({ x: props.overlayPos.x, y: clampY(props.overlayPos.y + step) });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });


  const onPointerDown = (e: React.PointerEvent) => {
    if (!props.editMode || props.view !== "front") return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.y) / rect.height) * 100;
    dragRef.current = { x: e.clientX, y: e.clientY };
    props.setOverlayPos({ x: clampX(props.overlayPos.x + dx), y: clampY(props.overlayPos.y + dy) });
  };
  const onPointerUp = () => { dragRef.current = null; };

  const fontClass =
    props.textFont === "brutal" ? "font-display" :
    props.textFont === "mono" ? "font-mono font-bold" : "font-sans font-black italic";

  const hasFrontOverlay = props.view === "front" && (props.customText || props.logoPos || props.logoImage);
  const showSleeveText = (props.view === "left" || props.view === "right") && Boolean(props.customText);
  const textPx = 12 + props.textSize * 0.6; // slider drives on-shirt size

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      <div
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border grain-overlay"
        style={{ backgroundColor: `color-mix(in oklab, ${props.color.hex} 15%, var(--cream))` }}
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
                src={props.color.image}
                alt=""
                className={`max-h-full max-w-full object-contain mix-blend-multiply ${detail ? "scale-125" : ""} ${props.view !== "front" ? "opacity-90" : ""}`}
                style={props.view === "back" ? { transform: "scaleX(-1)" } :
                       props.view === "left" ? { transform: "perspective(800px) rotateY(35deg)" } :
                       props.view === "right" ? { transform: "perspective(800px) rotateY(-35deg)" } : undefined}
              />
            ) : (
              <div className="h-3/4 w-3/4 rounded-xl" style={{ backgroundColor: props.color.hex }} />
            )}

            {/* Printable safe zone dashed rect on front while editing */}
            {props.view === "front" && props.editMode && (
              <div
                className="pointer-events-none absolute rounded-md border-2 border-dashed border-foreground/40"
                style={{ left: "30%", top: "22%", width: "40%", height: "50%" }}
                aria-label={t("printable_zone")}
              />
            )}

            {/* Front overlay content */}
            {hasFrontOverlay && (
              <div
                className="pointer-events-none absolute flex flex-col items-center gap-1"
                style={{
                  left: `calc(50% + ${props.overlayPos.x}%)`,
                  top: `calc(50% + ${props.overlayPos.y}%)`,
                  width: props.logoImage ? `${props.logoSize}%` : undefined,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {props.logoImage && (
                  <img
                    src={props.logoImage}
                    alt=""
                    draggable={false}
                    className="pointer-events-none w-full select-none object-contain drop-shadow-md"
                  />
                )}
                {props.logoPos && !props.logoImage && (
                  <div className="holo-gradient rounded-md px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                    MRC
                  </div>
                )}
                {props.customText && (
                  <span
                    className={`${fontClass} uppercase tracking-tight`}
                    style={{
                      fontSize: `${textPx}px`,
                      lineHeight: 1,
                      color: props.textColor,
                      textShadow: `0 0 1px ${contrastStroke(props.textColor, props.color.hex)}, 0 1px 2px rgba(0,0,0,0.15)`,
                    }}
                  >
                    {props.customText}
                  </span>
                )}
              </div>
            )}

            {/* Sleeve text mirror on left/right views */}
            {showSleeveText && (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: props.view === "left" ? "22%" : "78%",
                  top: "42%",
                  transform: `translate(-50%, -50%) perspective(600px) rotateY(${props.view === "left" ? 35 : -35}deg)`,
                }}
              >
                <span
                  className={`${fontClass} uppercase tracking-tight`}
                  style={{
                    fontSize: `${Math.max(10, textPx * 0.55)}px`,
                    lineHeight: 1,
                    color: props.textColor,
                    textShadow: `0 0 1px ${contrastStroke(props.textColor, props.color.hex)}, 0 1px 2px rgba(0,0,0,0.15)`,
                  }}
                >
                  {props.customText}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>


        {/* Floating status badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: props.color.hex }} />
          {props.color.name} · {t(viewLabels[props.view])}
        </div>

        {/* Non-front notice */}
        {props.view !== "front" && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-md border border-dashed border-foreground/40 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            {t("front_only")}
          </div>
        )}

        {/* Overlay controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5">
          <IconBtn onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))} label={t("zoom_in")}><ZoomIn className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))} label={t("zoom_out")}><ZoomOut className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setRot((r) => r - 15)} label={t("rotate_l")}><RotateCcw className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setRot((r) => r + 15)} label={t("rotate_r")}><RotateCw className="h-4 w-4" /></IconBtn>
          <IconBtn onClick={() => setDetail((d) => !d)} label={t("fabric_detail")} active={detail}><Sparkles className="h-4 w-4" /></IconBtn>
        </div>

        {/* Edit mode toggle (only on front) */}
        {props.view === "front" && (props.logoPos || props.customText || props.logoImage) && (
          <button
            onClick={() => props.setEditMode(!props.editMode)}
            className={`absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur transition ${
              props.editMode ? "border-foreground bg-foreground text-background" : "border-border bg-background/90"
            }`}
          >
            <Move className="h-3.5 w-3.5" />
            {props.editMode ? t("done_editing") : t("edit_position")}
          </button>
        )}
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-2">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => { props.setView(v); props.setEditMode(false); }}
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
