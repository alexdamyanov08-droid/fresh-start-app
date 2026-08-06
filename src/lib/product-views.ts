// Calcula la URL de la imagen correspondiente a una vista (frontal/espalda/manga)
// de un producto, a partir del sistema de nombres de archivo del proveedor:
//   p_[referencia 4 dígitos]_[código color 2 dígitos]_[perspectiva]_1.png
//
// Las imágenes se guardan en el bucket "vistas-productos" de Supabase Storage.

import type { View } from "@/components/customizer/Viewer";

const R2_PUBLIC_URL = "https://pub-597cce2a5bf94f1193f57972dd27c3fc.r2.dev";

// Código de perspectiva que usa el proveedor para cada vista
const PERSPECTIVE_BY_VIEW: Record<View, string> = {
  front: "1",
  back: "2",
  left: "7",
  right: "8",
};

/**
 * Extrae el código de color de 2 dígitos a partir de la URL de la imagen
 * frontal que ya usa la web (ej: ..._01_2_1.jpg -> "01").
 */
function extractColorCode(colorImageUrl: string | null): string | null {
  if (!colorImageUrl) return null;
  const match = colorImageUrl.match(/_(\d+)_\d+_\d+\.\w+$/);
  return match ? match[1] : null;
}

/**
 * Extrae los 4 dígitos de referencia a partir del código de producto
 * (ej: "BD7200" -> "7200", "CJ0325" -> "0325").
 */
function extractRefCode(productCode: string): string {
  return productCode.slice(-4);
}

/**
 * Devuelve la URL de la imagen para la vista pedida, o null si no se puede
 * calcular (por ejemplo, si el color no tiene imagen de referencia).
 */
export function getViewImage(
  productCode: string,
  colorImageUrl: string | null,
  view: View
): string | null {
  // La vista frontal ya funciona con la imagen que viene del proveedor
  if (view === "front") return colorImageUrl;

  const ref = extractRefCode(productCode);
  const colorCode = extractColorCode(colorImageUrl);
  if (!colorCode) return colorImageUrl; // sin código de color, no podemos calcular la vista

  const perspective = PERSPECTIVE_BY_VIEW[view];
  const filename = `p_${ref}_${colorCode}_${perspective}_1.jpg`;

  return `${R2_PUBLIC_URL}/${filename}`;
}