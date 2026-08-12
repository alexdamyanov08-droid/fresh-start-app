// Edge Function: stripe-webhook
// Stripe llama a esta funcion automaticamente cuando un pago se confirma
// de verdad. Verificamos la firma (para que nadie pueda fingir un pago),
// marcamos el pedido como "paid" en Supabase, y enviamos el email de
// confirmacion al cliente via Resend (si hay clave configurada).

import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

Deno.serve(async (req) => {
  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Faltan variables de entorno del servidor");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();
    if (!signature) throw new Error("Falta la firma de Stripe");

    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderNumber = session.metadata?.order_number;
      if (orderNumber) {
        const { data: order, error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_status: session.payment_status,
            paid_at: new Date().toISOString(),
          })
          .eq("order_number", orderNumber)
          .select()
          .single();

        if (updateError) throw updateError;

        if (RESEND_API_KEY && order?.customer_email) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Xprint Wear <onboarding@resend.dev>",
                to: order.customer_email,
                subject: `Pedido confirmado — ${order.order_number}`,
                html: `
                  <h2>¡Gracias por tu pedido!</h2>
                  <p>Hemos recibido tu pago correctamente. Tu pedido <strong>${order.order_number}</strong> ya está en marcha.</p>
                  <p><strong>Total:</strong> €${Number(order.total).toFixed(2)}</p>
                  <p>Te avisaremos por email cuando tu pedido salga hacia tu dirección.</p>
                  <p>Gracias por confiar en Xprint Wear.</p>
                `,
              }),
            });
          } catch (emailErr) {
            // No hacemos fallar el webhook si el email falla; el pedido ya quedo guardado.
            console.error("Error enviando email de confirmacion:", emailErr);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }
});
