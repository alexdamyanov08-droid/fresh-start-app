# Script para corregir los circulos de color: cada tono con nombre propio (Verde Kelly,
# Verde Botella, Azul Zen, Azul Dusty, etc.) pasa a tener su propio hex distinto,
# en vez de compartir un color generico con toda la familia (todos los verdes iguales, etc.).
# Solo actualiza el campo "hex" de colores de un solo tono (no bicolores tipo "Blanco/Negro",
# que se dejan tal cual estan).
import json, unicodedata, re

PATH = "src/data/products.ts"

PALETTE = json.loads('''{"BLANCO":"#f8f8f5","BLANCO VINTAGE":"#f2ede1","BLANCO CENIZA VIGORE":"#e6e4df","BEIGE":"#e8dcc3","ARENA":"#ddc9a3","ARENA OSCURO":"#c2a877","NUDE":"#e6c3a0","GRIS":"#9ca3af","GRIS CLARO":"#c7cdd4","GRIS PERLA":"#b6bcc6","GRIS VIGORE":"#6b7280","PLOMO":"#71717a","PLOMO OSCURO":"#4b4b52","NEGRO":"#0a0a0a","NEGRO VIGORE":"#2b2b2e","EBANO":"#1c1917","EBANO VIGORE":"#292420","MOCA":"#6f4e37","CHOCOLATE":"#4a2c17","NOGAL":"#6b4226","VAQUERO":"#5b7590","ROYAL":"#1e40af","AZUL SWEET":"#60a5fa","AZUL DUSTY":"#7c93b3","AZUL ELECTRICO":"#0057ff","AZUL LAVADO":"#6b8cae","AZUL LUZ DE LUNA":"#a8c5e0","AZUL MARINO VIGORE":"#1e2a4a","AZUL OCEANO":"#006994","AZUL PROFUNDO":"#1e3a8a","AZUL TORMENTA":"#64748b","AZUL ZEN":"#7dabd4","AZUL CALMA":"#8fb8d8","AZUL DENIM":"#4a6fa5","AZUL LAGO":"#3a8fb7","AZUL RIVIERA":"#29b6c9","MARINO":"#0f1b3d","CELESTE":"#7dd3fc","TURQUESA":"#14b8a6","TURQUESA FLUOR":"#00d4c4","TURQUESA VIGORE":"#3dbfae","VERDE FLUOR":"#4ade80","VERDE HELECHO":"#3f9142","VERDE MILITAR":"#6b7c3f","VERDE MILITAR OSCURO":"#4a5a2a","VERDE LAUREL":"#2f5233","VERDE OASIS":"#059669","VERDE BOTELLA":"#14532d","VERDE TROPICAL":"#22c55e","VERDE PINO":"#1e4d2b","VERDE HUMO":"#7c9885","VERDE AVENTURA":"#4d7c3f","VERDE IRISH":"#009e49","VERDE KELLY":"#4cbb17","VERDE GRASS":"#7cb342","VERDE MANTIS":"#8bc34a","VERDE MENTA":"#98e8c1","VERDE MIST":"#a8c9b0","JADE":"#00a86b","AMARILLO":"#facc15","AMARILLO FLUOR":"#eaff00","AMARILLO GOLDEN":"#f0b429","AMARILLO CURRY":"#d9a441","AMARILLO MAIZ":"#f5d033","AMARILLO SWEET":"#ffe066","OCRE":"#cc8400","NARANJA":"#f97316","NARANJA FLUOR":"#ff6f00","NARANJA FUEGO":"#e8490a","NARANJA CLAY":"#d2691e","NARANJA BERMELLON":"#e34234","NARANJA GREEK":"#ea7317","TEJA":"#b8541a","ROJO":"#c81e1e","ROJO BAYA":"#a3193d","ROJO CRISANTEMO":"#d1293d","ROJO PALIDO":"#e57373","ROJO CIRUELA":"#6b1e3a","GRANATE":"#7f1d1d","BORGONA":"#6d1a2f","FRAMBUESA":"#c2185b","CORAL":"#ff7f6a","CORAL FLUOR":"#ff5e62","ROSA CLARO":"#f9a8d4","ROSA SEDA":"#f8c8dc","ROSA FLUOR":"#ff2d95","ROSA LADY FLUOR":"#ff4fa0","ROSETON":"#e11d8f","ROSETON VIGORE":"#d6549a","FUCSIA":"#d946ef","PURPURA":"#7c3aed","MORADO":"#6d28d9","IRIS PURPURA":"#8b5cf6","LILA":"#c4b5fd","LAVANDA":"#b19cd9","ORQUIDEA":"#c084fc","VIOLET CHINE":"#a78bfa","AGUAMARINA":"#67e8f9","OPALO":"#b8d4d0","MENTA OSCURO":"#4a9b8e","ESPANA":"#c60b1e","FRANCIA":"#002654","ITALIA":"#009246","PORTUGAL":"#046a38","BANDERA ALEMANIA":"#ffcc00","BANDERA REINO UNIDO":"#00247d","ANGORA":"#c9b79c","LIMA":"#a3e635","LIMA LIMON":"#bef264","LIMA PUNCH":"#84cc16"}''')

def norm(s):
    s = str(s).strip().upper()
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", s)

with open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

marker = "export const products: Product[] = "
start = content.find(marker)
if start == -1:
    raise SystemExit("No se encontro el marcador esperado en products.ts")
arr_start = start + len(marker)
end = content.rfind("];")
if end == -1:
    raise SystemExit("No se encontro el cierre del array en products.ts")

header = content[:arr_start]
tail = content[end + 2:]
products = json.loads(content[arr_start:end + 1])

updated = 0
unchanged = 0
skipped_bicolor = 0
skipped_unknown = 0

for p in products:
    for c in p["colors"]:
        if "/" in c["name"]:
            skipped_bicolor += 1
            continue
        key = norm(c["name"])
        new_hex = PALETTE.get(key)
        if new_hex is None:
            skipped_unknown += 1
            continue
        if c["hex"] != new_hex:
            c["hex"] = new_hex
            updated += 1
        else:
            unchanged += 1

arr_json = json.dumps(products, ensure_ascii=False, separators=(",", ": "))
new_content = header + arr_json + ";" + tail

with open(PATH, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Colores actualizados con tono nuevo: {updated}")
print(f"Ya tenian el tono correcto: {unchanged}")
print(f"Bicolores (sin tocar): {skipped_bicolor}")
print(f"Nombres de color sin paleta definida (sin tocar): {skipped_unknown}")
