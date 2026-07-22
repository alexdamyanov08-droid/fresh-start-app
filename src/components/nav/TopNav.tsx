import { Link } from "@tanstack/react-router";
import { ShoppingBag, User as UserIcon, ChevronDown, Sparkles, Truck, Clock, Languages } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";


declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

function triggerTranslate(target: "en" | "es") {
  const select = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!select) return false;
  select.value = target === "es" ? "" : target;
  select.dispatchEvent(new Event("change"));
  return true;
}

function useGoogleTranslate() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "es", includedLanguages: "en,es", autoDisplay: false },
        "google_translate_element",
      );
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
    // Hide Google's default banner/frame but keep the widget functional.
    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
      body { top: 0 !important; position: static !important; }
      #google_translate_element { position: absolute; left: -9999px; top: -9999px; }
      .goog-tooltip, .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background: transparent !important; box-shadow: none !important; }
      font { background: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
  }, []);
}


const CATEGORIES = [
  { label: "Camisetas", family: "Camisetas" },
  { label: "Sudaderas", family: "Sudaderas" },
  { label: "Polos", family: "Polos" },
  { label: "Softshells", family: "Softshells" },
];

export function TopNav() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const [prodOpen, setProdOpen] = useState(false);
  const prodRef = useRef<HTMLLIElement>(null);
  const [lang, setLang] = useState<"es" | "en">("es");
  useGoogleTranslate();

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    // The Google Translate widget script needs a moment to inject the select.
    // Retry a few times if the select isn't there yet.
    let attempts = 0;
    const tryIt = () => {
      if (triggerTranslate(next) || attempts++ > 20) {
        setLang(next);
        return;
      }
      setTimeout(tryIt, 150);
    };
    tryIt();
  };


  useEffect(() => {
    if (!prodOpen) return;
    const onClick = (e: MouseEvent) => {
      if (prodRef.current && !prodRef.current.contains(e.target as Node)) setProdOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [prodOpen]);



  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-brand text-brand-foreground text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-1.5 px-4 py-2 sm:px-6">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span className="font-semibold tracking-wide">PERSONALIZAMOS LO QUE IMAGINES</span>
            <Sparkles className="h-3.5 w-3.5 text-gold" />
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Truck className="h-3.5 w-3.5 text-gold" />
            <span className="font-semibold tracking-wide">ENVÍOS A TODA ESPAÑA</span>
          </span>
          <span className="hidden items-center gap-1.5 md:flex">
            <Clock className="h-3.5 w-3.5 text-gold" />
            <span className="font-semibold tracking-wide">PLAZOS RÁPIDOS</span>
          </span>
        </div>
      </div>

      <div className="border-b border-border bg-background">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="shrink-0">
            <img src="/logo-horizontal.png" alt="XPRINTWEAR" className="h-16 w-auto sm:h-20" />
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            <li className="relative" ref={prodRef}>
              <button
                onClick={() => setProdOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-brand transition hover:text-gold"
              >
                Productos
                <ChevronDown className={`h-4 w-4 transition ${prodOpen ? "rotate-180" : ""}`} />
              </button>
              {prodOpen && (
                <div className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.family}
                      to="/shop"
                      onClick={() => setProdOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide text-brand transition hover:bg-sand hover:text-gold"
                    >
                      {c.label}
                    </Link>
                  ))}
                  <Link
                    to="/shop"
                    onClick={() => setProdOpen(false)}
                    className="block border-t border-border bg-sand/60 px-4 py-3 text-xs font-bold uppercase tracking-widest text-brand transition hover:text-gold"
                  >
                    Ver todos →
                  </Link>
                </div>
              )}
            </li>
            <li>
              <Link
                to="/contacto"
                className="text-sm font-bold uppercase tracking-wider text-brand transition hover:text-gold"
              >
                Contacto
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              aria-label="Translate site"
              title={lang === "es" ? "Translate to English" : "Traducir a Español"}
              translate="no"
              className="notranslate flex items-center gap-1 rounded-full border border-brand/20 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand transition hover:bg-sand"
            >
              <Languages className="h-4 w-4" />
              {lang === "es" ? "EN" : "ES"}
            </button>
            <div id="google_translate_element" />
            <Link
              to={user ? "/account" : "/auth"}
              aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
              className="rounded-full p-2 text-brand transition hover:bg-sand"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label={`Carrito (${count} artículos)`}
              className="relative rounded-full p-2 text-brand transition hover:bg-sand"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-brand">
                  {count}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
