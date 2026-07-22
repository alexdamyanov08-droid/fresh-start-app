import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad — XPRINTWEAR" },
      { name: "description", content: "Política de privacidad de XPRINTWEAR: responsable del tratamiento, datos recopilados, finalidad, conservación, derechos y seguridad." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl uppercase text-brand">Política de privacidad</h1>

      <section className="mt-10 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Responsable del tratamiento</h2>
        <ul className="space-y-1">
          <li><strong>Empresa:</strong> [Nombre de la empresa]</li>
          <li><strong>CIF/NIF:</strong> [CIF/NIF]</li>
          <li><strong>Correo electrónico:</strong> pedidos@xprintwear.es</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Datos personales recopilados</h2>
        <p>Durante el uso del sitio web podrán recopilarse los siguientes datos:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Nombre y apellidos.</li>
          <li>Dirección de envío y facturación.</li>
          <li>Dirección de correo electrónico.</li>
          <li>Número de teléfono.</li>
          <li>Datos necesarios para la gestión de pedidos.</li>
          <li>Archivos e imágenes cargados por el cliente para la personalización de productos.</li>
          <li>Dirección IP e información técnica del navegador.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Finalidad del tratamiento</h2>
        <p>
          Los datos personales se utilizarán para: gestionar pedidos; procesar pagos; realizar envíos;
          atender consultas; personalizar productos; cumplir obligaciones legales; mejorar la
          experiencia del usuario.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Conservación de los datos</h2>
        <p>
          Los datos se conservarán únicamente durante el tiempo necesario para cumplir con las
          obligaciones legales y contractuales.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Derechos del usuario</h2>
        <p>El usuario podrá ejercer los derechos de:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Acceso.</li>
          <li>Rectificación.</li>
          <li>Supresión.</li>
          <li>Limitación del tratamiento.</li>
          <li>Oposición.</li>
          <li>Portabilidad de los datos.</li>
        </ul>
        <p>
          Las solicitudes podrán enviarse a:{" "}
          <a href="mailto:pedidos@xprintwear.es" className="text-gold">pedidos@xprintwear.es</a>.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Seguridad</h2>
        <p>
          La empresa adopta medidas técnicas y organizativas adecuadas para proteger la información
          personal frente a accesos no autorizados, pérdida o alteración.
        </p>
      </section>
    </div>
  ),
});
