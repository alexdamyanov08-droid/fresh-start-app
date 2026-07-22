import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";


const CATS = ["Camisetas", "Sudaderas", "Polos", "Softshells"];

export function Footer() {
  return (
    <footer className="mt-20">
      <div className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <img src="/logo.png" alt="XPRINTWEAR" className="h-24 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Personalización textil y merchandising para grupos, eventos, peñas y ocasiones especiales.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">Productos</h4>
            <ul className="space-y-2 text-sm">
              {CATS.map((c) => (
                <li key={c}>
                  <Link to="/shop" className="text-foreground/80 transition hover:text-gold">
                    {c}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="font-semibold text-brand transition hover:text-gold">
                  Ver todos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <a href="mailto:pedidos@xprintwear.es" className="transition hover:text-gold">
                  pedidos@xprintwear.es
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a href="tel:+34876441275" className="transition hover:text-gold">
                  876 44 12 75
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Enviamos a toda España</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6">
          <p className="text-brand-foreground/80">© {new Date().getFullYear()} XPRINTWEAR</p>
          <ul className="flex flex-wrap items-center gap-6">
            <li>
              <Link to="/aviso-legal" className="uppercase tracking-wider transition hover:text-gold">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link to="/privacidad" className="uppercase tracking-wider transition hover:text-gold">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="uppercase tracking-wider transition hover:text-gold">
                Política de cookies
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
