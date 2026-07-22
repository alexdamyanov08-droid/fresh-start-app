import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de cookies — XPRINTWEAR" },
      { name: "description", content: "Política de cookies de XPRINTWEAR: tipos de cookies, cookies de terceros, gestión y eliminación." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl uppercase text-brand">Política de cookies</h1>

      <section className="mt-10 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos que se almacenan en el dispositivo del usuario para
          mejorar la navegación y el funcionamiento del sitio web.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Tipos de cookies utilizadas</h2>

        <h3 className="font-semibold text-brand">Cookies técnicas</h3>
        <p>Necesarias para el funcionamiento del sitio web, incluyendo:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Inicio de sesión.</li>
          <li>Carrito de compra.</li>
          <li>Idioma seleccionado.</li>
          <li>Preferencias del usuario.</li>
        </ul>

        <h3 className="mt-4 font-semibold text-brand">Cookies de análisis</h3>
        <p>Permiten conocer estadísticas de uso del sitio web con el fin de mejorar sus servicios.</p>

        <h3 className="mt-4 font-semibold text-brand">Cookies de terceros</h3>
        <p>
          En caso de utilizar servicios como Google Analytics, Google Ads o Meta Pixel, podrán
          instalarse cookies gestionadas por dichos proveedores.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Gestión de cookies</h2>
        <p>
          El usuario puede aceptar, rechazar o configurar el uso de cookies desde el banner de
          consentimiento o mediante la configuración de su navegador.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Eliminación de cookies</h2>
        <p>
          Las cookies pueden eliminarse en cualquier momento desde la configuración del navegador
          utilizado por el usuario.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Actualizaciones</h2>
        <p>
          La presente Política de Cookies podrá modificarse cuando existan cambios legales o técnicos
          que afecten al tratamiento de cookies.
        </p>
      </section>
    </div>
  ),
});
