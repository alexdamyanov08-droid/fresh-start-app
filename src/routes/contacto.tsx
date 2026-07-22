import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — XPRINTWEAR" },
      { name: "description", content: "Contáctanos para tu proyecto de personalización textil. Envíos a toda España." },
      { property: "og:title", content: "Contacto — XPRINTWEAR" },
      { property: "og:description", content: "Escríbenos y te ayudamos a crear algo único para tu grupo." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success("¡Gracias! Te responderemos lo antes posible.");
    }, 600);
  };

  return (
    <div className="bg-sand">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Contacto</p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-tight text-brand sm:text-5xl">
            Cuéntanos <span className="text-gold">tu idea</span>
          </h1>
          <p className="mt-4 text-base text-foreground/70">
            Escríbenos con los detalles de tu proyecto y te enviaremos una propuesta personalizada sin compromiso.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand">Información</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand">
                    <Mail className="h-4 w-4 text-gold" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                    <a href="mailto:pedidos@xprintwear.es" className="font-semibold text-brand transition hover:text-gold">
                      pedidos@xprintwear.es
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand">
                    <Phone className="h-4 w-4 text-gold" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Teléfono</p>
                    <a href="tel:+34876441275" className="font-semibold text-brand transition hover:text-gold">
                      876 44 12 75
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand">
                    <MapPin className="h-4 w-4 text-gold" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Envíos</p>
                    <p className="font-semibold text-brand">Enviamos a toda España</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-brand p-6 text-brand-foreground">
              <h3 className="font-display text-xl uppercase text-gold">Horario</h3>
              <p className="mt-2 text-sm text-brand-foreground/85">Lunes a Viernes · 9:00 – 18:00</p>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">Nombre</span>
                <input required name="name" className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">Email</span>
                <input required type="email" name="email" className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">Teléfono (opcional)</span>
                <input name="phone" className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">Cuéntanos tu proyecto</span>
                <textarea required name="message" rows={5} className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand" />
              </label>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-brand-foreground transition hover:bg-brand/90 disabled:opacity-60"
            >
              {sending ? "Enviando…" : (<>Enviar <Send className="h-4 w-4" /></>)}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
