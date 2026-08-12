import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

/**
 * Comprueba si la persona logueada es administradora, consultando la tabla
 * "admins". Gracias a las politicas de seguridad (RLS) de esa tabla, cada
 * usuario solo puede ver su PROPIA fila: si aparece una fila, es admin; si
 * no aparece ninguna, no lo es. Nadie puede ver la lista completa desde el
 * navegador, solo la suya propia.
 *
 * Nota: se usa `as any` en la consulta porque los tipos de Supabase
 * (src/integrations/supabase/types.ts) todavia no se han regenerado desde
 * que se crearon las tablas "orders" y "admins". Funciona igual, solo que
 * TypeScript no valida esos nombres de columna automaticamente.
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    (supabase as any)
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: { data: unknown }) => {
        if (!cancelled) {
          setIsAdmin(Boolean(data));
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isAdmin, checking };
}
