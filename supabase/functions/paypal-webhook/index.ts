import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";
import { corsMiddleware } from "../_shared/cors.middleware.ts";
import { webhookSecurityMiddleware } from "../_shared/webhook.security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || "";
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_MODE") === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// .com.rich é TLD próprio - não precisa de registro externo
// Ativação instantânea após pagamento confirmado
async function activateDomain(fqdn: string, domainId: string, supabase: any): Promise<void> {
  try {
    console.log(`[Activation] Activating domain ${fqdn} (ID: ${domainId})`);

    // Calcular expiração (1 ano a partir de agora)
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const { data: updateData, error: updateError } = await supabase
      .from("domains")
      .update({
        registrar_status: "active",
        expires_at: expiresAt,
      })
      .eq("id", domainId)
      .select();

    if (updateError) {
      console.error(`[Activation] Database update error for ${fqdn}:`, updateError);
      throw updateError;
    }

    console.log(`[Activation] ✅ Domain ${fqdn} activated successfully`);
    console.log(`[Activation] Expires at: ${expiresAt}`);
  } catch (error) {
    console.error(`[Activation] ❌ Exception during activation of ${fqdn}:`, error);

    try {
      const { error: updateError } = await supabase
        .from("domains")
        .update({
          registrar_status: "failed",
        })
        .eq("id", domainId);

      if (updateError) {
        console.error(`[Activation] Database update error (exception) for ${fqdn}:`, updateError);
      }
    } catch (dbError) {
      console.error(`[Activation] Failed to update database after exception:`, dbError);
    }
  }
}

async function verifyPayPalWebhook(headers: Headers, body: string): Promise<boolean> {
  console.warn("PayPal webhook verification skipped - configure PAYPAL_WEBHOOK_ID for production");
  return true;
}

async function handlePaymentCapture(event: any, supabase: any) {
  const orderId = event.resource?.id || event.resource?.supplementary_data?.related_ids?.order_id;

  console.log(`[PayPal Webhook] Processing payment capture for order: ${orderId}`);

  if (!orderId) {
    console.error("[PayPal Webhook] ❌ Missing order ID in payment");
    return { success: false, error: "Missing order ID" };
  }

  try {
    console.log(`[PayPal Webhook] Looking up pending order: ${orderId}`);

    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("paypal_order_id", orderId)
      .maybeSingle();

    if (pendingError) throw pendingError;

    if (!pendingOrder) {
      console.error(`[PayPal Webhook] ❌ Pending order not found: ${orderId}`);
      return { success: false, error: "Pending order not found" };
    }

    console.log(`[PayPal Webhook] Found pending order for domain: ${pendingOrder.fqdn}`);

    await supabase
      .from("pending_orders")
      .update({ status: "completed" })
      .eq("id", pendingOrder.id);

    console.log(`[PayPal Webhook] Pending order marked as completed`);

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", pendingOrder.user_id)
      .maybeSingle();

    if (!customer) {
      console.error(`[PayPal Webhook] ❌ Customer not found for user: ${pendingOrder.user_id}`);
      return { success: false, error: "Customer not found" };
    }

    console.log(`[PayPal Webhook] Found customer: ${customer.id}`);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        fqdn: pendingOrder.fqdn,
        years: 1,
        plan: "basic",
        total_cents: Math.round(pendingOrder.amount * 100),
        status: "completed",
      })
      .select()
      .single();

    if (orderError) {
      console.error(`[PayPal Webhook] ❌ Failed to create order:`, orderError);
      throw orderError;
    }

    console.log(`[PayPal Webhook] Order created: ${order.id}`);

    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .insert({
        customer_id: customer.id,
        fqdn: pendingOrder.fqdn,
        registrar_status: "pending",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (domainError) {
      console.error(`[PayPal Webhook] ❌ Failed to create domain:`, domainError);
      throw domainError;
    }

    console.log(`[PayPal Webhook] Domain created: ${domain.id} (${pendingOrder.fqdn})`);
    console.log(`[PayPal Webhook] ✅ Payment processed successfully for ${pendingOrder.fqdn}`);

    console.log(`[PayPal Webhook] Activating domain...`);
    await activateDomain(pendingOrder.fqdn, domain.id, supabase);

    console.log(`[PayPal Webhook] 🎉 Complete! Order: ${order.id}, Domain: ${domain.id}`);
    return { success: true, order_id: order.id, domain_id: domain.id };
  } catch (error) {
    console.error(`[PayPal Webhook] ❌ Error handling payment capture:`, error);
    return { success: false, error: String(error) };
  }
}

async function handleSubscriptionActivated(event: any, supabase: any) {
  const subscription = event.resource;
  const customId = subscription.custom_id;
  
  if (!customId) {
    console.error("Missing custom_id in subscription");
    return { success: false, error: "Missing custom_id" };
  }

  const [userId, plan] = customId.split("|");

  if (!userId) {
    console.error("Invalid custom_id format");
    return { success: false, error: "Invalid custom_id" };
  }

  try {
    await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        paypal_subscription_id: subscription.id,
        plan: plan || "basic",
        status: subscription.status,
        current_period_start: subscription.start_time,
        current_period_end: subscription.billing_info?.next_billing_time,
      });

    return { success: true };
  } catch (error) {
    console.error("Error handling subscription activated:", error);
    return { success: false, error: String(error) };
  }
}

async function handleSubscriptionCancelled(event: any, supabase: any) {
  const subscription = event.resource;

  try {
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("paypal_subscription_id", subscription.id);

    return { success: true };
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // IDEMPOTENCY CHECK: Verify if we already processed this event
    const eventId = event.id;
    if (eventId) {
      const { data: existingEvent } = await supabaseClient
        .from("webhook_events")
        .select("id")
        .eq("provider", "paypal")
        .eq("external_id", eventId)
        .maybeSingle();

      if (existingEvent) {
        console.log(`[PayPal Webhook] Event ${eventId} already processed, skipping`);
        return new Response(
          JSON.stringify({ success: true, message: "Event already processed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let result: any;

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        result = await handlePaymentCapture(event, supabaseClient);
        break;

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        result = await handleSubscriptionActivated(event, supabaseClient);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        result = await handleSubscriptionCancelled(event, supabaseClient);
        break;

      default:
        console.log("Unhandled event type:", event.event_type);
        result = { success: true, message: "Event received" };
    }

    // Store event as processed if we have an event ID
    if (eventId && result.success !== false) {
      await supabaseClient
        .from("webhook_events")
        .insert({
          provider: "paypal",
          external_id: eventId,
          event_type: event.event_type,
          payload: event,
        })
        .catch((err) => {
          console.error("Failed to store webhook event:", err);
          // Don't fail the request if storage fails
        });
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});