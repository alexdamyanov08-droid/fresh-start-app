// Edge Function: create-checkout-session
// Recibe los datos del pedido desde el checkout de la web, crea una fila
// "pending" en la tabla orders, y abre una sesion de pago real en Stripe.
// La clave secreta de Stripe vive solo aqui (variable de entorno del
// servidor), nunca en el codigo del navegador.

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Faltan variables de entorno del servidor");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const {
      items, subtotal, shipping, tax, total,
      customerEmail, customerName, customerPhone,
      shippingAddress, origin,
    } = body;

    if (!items?.length || !total || !origin) {
      return new Response(JSON.stringify({ error: "Datos de pedido incompletos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderNumber = "XPW-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const { error: insertError } = await supabase.from("orders").insert({
      order_number: orderNumber,
      status: "pending",
      customer_email: customerEmail ?? null,
      customer_name: customerName ?? null,
      customer_phone: customerPhone ?? null,
      shipping_address: shippingAddress ?? null,
      items,
      subtotal, shipping, tax, total,
    });
    if (insertError) throw insertError;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(total * 100),
            product_data: {
              name: `Pedido Xprint Wear #${orderNumber}`,
              description: `${items.length} prenda(s) personalizada(s)`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { order_number: orderNumber },
      success_url: `${origin}/thanks?order=${orderNumber}`,
      cancel_url: `${origin}/checkout`,
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("order_number", orderNumber);

    return new Response(JSON.stringify({ url: session.url, orderNumber }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
