## Heads-up on the stack

This Lovable project is a **React (TanStack Start) app**, not a WordPress install — I can't ship PHP plugin files or a child theme from here. What I *can* build, and what will look exactly like the design you described, is the **full React streetwear storefront + customizer** using your `WEB_ROLY.xlsx` catalog as the product source. If you later want it inside WordPress, this same app can be either:

- embedded into a WordPress page via an `<iframe>` / script mount, or
- wired to WooCommerce's REST API (via the WordPress connector) so cart/checkout run through your WooCommerce store.

I'll flag WooCommerce integration points in the code as we go so the swap is straightforward. Below is the plan for the app itself.

---

## What we're building

A streetwear e-commerce site with a 150+ product catalog (seeded from your spreadsheet) and a premium product customizer where **only the FRONT view is editable**, but Front / Back / Left / Right buttons are all visible and functional (Back/Left/Right show the same product image with a subtle "customization not available on this view" state — buttons stay tactile and animated).

### 1. Product data
- Parse `WEB_ROLY.xlsx` at build time → generate `src/data/products.ts` with a typed list.
- Group rows by `MODELCODE` so one product = one model with its size + color variants (dedupe the ~3500 SKU rows into ~150 unique models).
- Fields kept: model name, description, category, gender, price tiers, color swatches (COLORCODE), sizes, `PRODUCTIMAGE` URL.
- Product images pulled directly from the Roly CDN URLs in the sheet.

### 2. Routes (TanStack Start file-based)
- `/` — landing / featured drops
- `/shop` — catalog grid (filter: category, gender, color; pagination 24/page)
- `/product/$modelCode` — customizer page
- `/cart` — cart drawer route (also opens as slide-in from any page)

Each route gets its own `head()` with unique title/description/og tags.

### 3. Design system (in `src/styles.css`)
- Backgrounds: soft beige `#F5F5DC`, crisp white.
- Accents: electric purple `#8B00FF`, vibrant blue `#00A3FF`.
- CTA gradient token: `--gradient-holo` (pink → purple → blue).
- Deep black `#0A0A0A` for typography + hairline borders.
- Typography: wide bold display font (Archivo Black / Anton via `<link>` in `__root.tsx`) for headers; Inter for controls.
- Everything as semantic tokens — no hardcoded colors in components.

### 4. Top nav
- Left: "NEO-STREET" wordmark.
- Center: Shop / Collections / About / Drop with animated underline.
- Right: cart icon w/ live badge, profile icon, EN/ES language toggle.
- `isSpanish` context + a `t()` helper with a strings dictionary. Toggling triggers a 150ms Framer Motion cross-fade on all translatable text.

### 5. Catalog page
- Responsive grid, product cards with hover lift + image cross-fade to second color.
- Filter sidebar (mobile: bottom-sheet drawer).
- Skeleton loaders on first paint; empty-state illustration for zero results.
- Pagination (24/page) — never render all products at once.

### 6. Customizer (`/product/$modelCode`) — the centerpiece

**Left column — Viewer**
- Large beige card with the product image centered.
- **View switcher** buttons: Front / Back / Left / Right — all four rendered, all tactile.
  - Front = editable canvas (logo/text overlays render on top).
  - Back / Left / Right = same product image with a small dashed badge: *"Customization available on Front only"* (buttons still animate, still switch state — the UI doesn't feel crippled).
- Overlay controls: Zoom +/−, Rotate L/R (rotates the image container, purely visual), Fabric Detail toggle (zooms + adds a subtle grain overlay).
- Floating status badge: *"Color: Electric Purple · View: Front"*.

**Right column — Control panel**
- Product title (wide display font) + live price.
- Size pill selector (XS–XXL), active = inverted black.
- Color swatches from the product's real color variants (circular, ring on active).
- Quantity stepper `[- 1 +]`, disabled at min 1.
- Tabs:
  - **Logo Placement** — preset positions on the front (Center Chest / Left Chest — Back position shown but disabled with tooltip "Front-only customization").
  - **Custom Text** — 15-char input, 3 streetwear font styles (via Tailwind utility classes), color picker with auto-contrast outline fallback.
- Drag-to-reposition on the front canvas, with:
  - keyboard nudge (arrow keys = 4px, Shift = 20px) for accessibility,
  - clamping to a dashed printable safe-zone,
  - explicit "Edit Position" mode toggle so drag doesn't fight the view switcher.

**Sticky bottom bar**
- Blurred backdrop, fixed.
- Left: live summary — *"Size L · Purple · Front Text: 'MIND'"*.
- Right: gradient ADD TO CART button, `active:scale-95`, toast confirmation on click.

### 7. Cart
- Slide-in drawer (Sheet component). Line items show thumbnail + config summary (size, color, placement, custom text) + qty + remove.
- Badge count in nav syncs live.
- State lifted to a `CartContext` with `localStorage` persistence, so customizations survive refresh.

### 8. Pricing logic
- Base price from spreadsheet's tiered pricing (use `1-10 uds`).
- Surcharges: +$8 per logo placement, +$12 per custom text.
- Total = (base + surcharges) × qty, updated live in the panel and sticky bar.

### 9. Responsive
- Desktop: 2-col split.
- Mobile (< md): viewer docks to top ~40vh, control panel becomes scrollable bottom sheet, filters become drawer, view-switcher stays as horizontal pill row.

### 10. Accessibility
- All buttons have `aria-label`s.
- Focus rings on every interactive element.
- Keyboard-operable placement (arrow keys) as the accessible equivalent of drag.
- Auto text-outline for low-contrast custom text on dark garments.

---

## Technical notes

- Framer Motion for: card hover, tab transitions, language cross-fade, add-to-cart toast, drawer slide.
- Lucide React for icons (ShoppingCart, User, Globe, ZoomIn, ZoomOut, RotateCw, etc.).
- No 3D library — the "3D-ish" feel comes from soft shadows, rotation transforms, and grain overlay, not Three.js.
- Product images: `<img loading="lazy" srcset>` from the Roly CDN URLs.
- Customization state in a lightweight Zustand store or React context, persisted to `localStorage`.

## Files I'll create / touch

```
src/data/products.ts             (generated from your xlsx at build)
src/lib/i18n.ts                  (EN/ES strings + t())
src/lib/cart-store.ts            (cart context + persistence)
src/lib/customizer-store.ts      (per-product customization state)
src/components/nav/TopNav.tsx
src/components/catalog/ProductCard.tsx
src/components/catalog/FilterBar.tsx
src/components/customizer/Viewer.tsx
src/components/customizer/ControlPanel.tsx
src/components/customizer/StickyBar.tsx
src/components/customizer/PlacementCanvas.tsx
src/components/cart/CartDrawer.tsx
src/routes/index.tsx             (replace placeholder)
src/routes/shop.tsx
src/routes/product.$modelCode.tsx
src/routes/cart.tsx
src/styles.css                   (streetwear token additions)
src/routes/__root.tsx            (real title/description/og + font <link>)
```

---

## One quick question before I build

Your spreadsheet has ~3500 rows across ~150 models with real image URLs from Roly's CDN. Want me to:

- **A)** Use those real Roly product images + names (Spanish streetwear/workwear catalog as-is), or
- **B)** Keep only the *structure* (150 products, colors, sizes) and swap in generic "NEO-STREET" branded placeholder imagery + made-up product names to match the streetwear vibe more aggressively?

Tell me A or B and I'll build.