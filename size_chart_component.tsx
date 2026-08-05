import { sortSizes } from "@/lib/sizes";

interface SizeChartEntry {
  size: string;
  ancho: number;
  largo: number;
}

interface SizeChartProps {
  sizeChart?: SizeChartEntry[];
  selectedSize?: string;
}

// Tabla de tallas desplegable. Muestra ancho y largo (en cm) por cada talla,
// resaltando la talla que el cliente tiene seleccionada en ese momento.
export function SizeChart({ sizeChart, selectedSize }: SizeChartProps) {
  if (!sizeChart || sizeChart.length === 0) return null;

  const orderedSizes = sortSizes(sizeChart.map((s) => s.size));
  const rows = orderedSizes
    .map((sz) => sizeChart.find((s) => s.size === sz))
    .filter((s): s is SizeChartEntry => Boolean(s));

  return (
    <details className="group rounded-lg border border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>📏 Tabla de tallas</span>
        <span className="transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="border-t border-border px-4 py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="py-1 pr-2">Talla</th>
              <th className="py-1 pr-2">Ancho (cm)</th>
              <th className="py-1">Largo (cm)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className={r.size === selectedSize ? "bg-muted font-semibold" : ""}>
                <td className="py-1 pr-2" translate="no">
                  <span className="notranslate">{r.size}</span>
                </td>
                <td className="py-1 pr-2">{r.ancho}</td>
                <td className="py-1">{r.largo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
