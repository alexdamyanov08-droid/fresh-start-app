import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso legal — XPRINTWEAR" },
      { name: "description", content: "Aviso legal de XPRINTWEAR: titularidad, condiciones de uso, propiedad intelectual, responsabilidad y legislación aplicable." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl uppercase text-brand">Aviso legal</h1>

      <section className="mt-10 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Información del titular</h2>
        <ul className="space-y-1">
          <li><strong>Nombre o razón social:</strong> Protex Wear, S.L.</li>
          <li><strong>CIF/NIF:</strong> B72983661</li>
          <li><strong>Domicilio social:</strong> Calle de la Letra L, Nº 6, Nave 1 – Pol. Ind. Malpica</li>
          <li><strong>Código Postal:</strong> 50016</li>
          <li><strong>Ciudad:</strong> Zaragoza</li>
          <li><strong>Provincia:</strong> Zaragoza</li>
          <li><strong>País:</strong> España</li>
          <li><strong>Correo electrónico:</strong> pedidos@xprintwear.es</li>
          <li><strong>Teléfono:</strong> 876 44 12 75</li>
          <li><strong>Sitio web:</strong> https://www.xprintwear.es/</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Objeto del sitio web</h2>
        <p>
          El sitio web XPRINTWEAR tiene como finalidad la venta y personalización de prendas textiles,
          ropa laboral y ropa deportiva mediante la incorporación de logotipos, textos e imágenes
          proporcionados por los clientes.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Condiciones de uso</h2>
        <p>
          El usuario se compromete a utilizar el sitio web de forma lícita y conforme a la legislación
          vigente, absteniéndose de realizar actividades que puedan dañar el funcionamiento del sitio o
          vulnerar los derechos de terceros.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Propiedad intelectual</h2>
        <p>
          Todos los contenidos del sitio web (textos, imágenes, logotipos, diseños, código fuente y
          demás elementos) son propiedad de Protex Wear, S.L. o de sus respectivos titulares y
          están protegidos por la legislación sobre propiedad intelectual e industrial.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Responsabilidad</h2>
        <p>
          La empresa no será responsable de los daños derivados del uso incorrecto del sitio web ni de
          interrupciones del servicio causadas por motivos técnicos ajenos a su control.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
        <h2 className="font-display text-xl uppercase text-brand">Legislación aplicable</h2>
        <p>El presente Aviso Legal se rige por la legislación española.</p>
      </section>

      <p className="mt-10 text-sm text-foreground/70">
        Para cualquier consulta escríbenos a{" "}
        <a href="mailto:pedidos@xprintwear.es" className="text-gold">pedidos@xprintwear.es</a>.
      </p>
    </div>
  ),
});
