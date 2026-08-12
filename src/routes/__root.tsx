import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../lib/i18n";
import { CartProvider } from "../lib/cart-store";
import { OrdersProvider } from "../lib/orders-store";
import { AuthProvider } from "../lib/auth-context";

import { TopNav } from "../components/nav/TopNav";
import { CartDrawer } from "../components/cart/CartDrawer";
import { Footer } from "../components/nav/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl uppercase text-foreground">404</h1>
        <h2 className="mt-4 font-display text-xl uppercase text-foreground">Off the grid</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist. Head back to Xprint Wear.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="holo-gradient inline-flex items-center justify-center rounded-full px-6 py-3 font-display text-sm uppercase tracking-widest text-white"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl uppercase text-foreground">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-foreground px-6 py-3 font-display text-xs uppercase tracking-widest text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-foreground px-6 py-3 font-display text-xs uppercase tracking-widest"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "XPRINTWEAR — Personalizamos lo que imagines" },
      { name: "description", content: "Personalización textil y merchandising para peñas, eventos, despedidas, comisiones y empresas. Envíos a toda España." },
      { name: "author", content: "XPRINTWEAR" },
      { property: "og:title", content: "XPRINTWEAR — Personalizamos lo que imagines" },
      { property: "og:description", content: "Ropa y merch personalizado para grupos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <OrdersProvider>
              <div className="min-h-screen">
                <TopNav />
                <main>
                  <Outlet />
                </main>
                <Footer />
                <CartDrawer />
                <Toaster position="top-center" richColors />
              </div>
            </OrdersProvider>
          </CartProvider>
        </AuthProvider>

      </I18nProvider>
    </QueryClientProvider>
  );
}
