import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";
import { rateLimitMiddleware } from "../_shared/rateLimit.middleware.ts";

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

async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("PayPal capture failed:", errorData);
    throw new Error(`Failed to capture PayPal order: ${response.status}`);
  }

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(req, 'POST:/paypal-capture');
  if (rateLimitResponse) return rateLimitResponse;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let captureResult: any;

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      if (IS_DEV) {
        console.log("[DEV MODE] PayPal not configured, simulating capture");
      }
      captureResult = {
        id: orderId,
        status: "COMPLETED"
      };
    } else {
      captureResult = await capturePayPalOrder(orderId);
    }

    const { data: pendingOrder } = await supabaseClient
      .from("pending_orders")
      .select("*")
      .eq("paypal_order_id", orderId)
      .maybeSingle();

    if (!pendingOrder) {
      return new Response(
        JSON.stringify({ error: "Pedido não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseClient
      .from("pending_orders")
      .update({ status: "completed" })
      .eq("id", pendingOrder.id);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!customer) {
      const { data: newCustomer } = await supabaseAdmin
        .from("customers")
        .insert({
          user_id: user.id,
          email: user.email || "",
        })
        .select()
        .single();

      if (newCustomer) {
        await processOrder(supabaseAdmin, newCustomer.id, pendingOrder);
      }
    } else {
      await processOrder(supabaseAdmin, customer.id, pendingOrder);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: captureResult.status,
        orderId: captureResult.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function registerDomainWithDynadot(fqdn: string, contactInfo: any, years: number = 1): Promise<{ success: boolean; orderId?: string; expirationDate?: number; error?: string }> {
  // Always use MOCK mode (proxy not needed)
  if (IS_DEV) {
    console.log("[MOCK] Registering domain:", fqdn, "for", years, "year(s)");
  }
  return {
    success: true,
    orderId: `mock-order-${Date.now()}`,
    expirationDate: Date.now() + (years * 365 * 24 * 60 * 60 * 1000)
  };

  /* Proxy code removed - not needed
  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command: "register",
        params: {
          domain: fqdn,
          duration: years
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Dynadot Proxy] HTTP error (${response.status}):`, errorText);
      return {
        success: false,
        error: `Proxy error: ${response.status}`,
      };
    }

    const data = await response.json();
    if (IS_DEV) {
      console.log(`[Dynadot Proxy] Response:`, JSON.stringify(data));
    }

    if (data.RegisterResponse?.Status === 0 || data.Status === 0) {
      if (IS_DEV) {
        console.log(`[Dynadot Proxy] Successfully registered ${fqdn}`);
      }

      const orderIdValue = data.RegisterResponse?.OrderId || data.OrderId || fqdn;
      const expirationValue = data.RegisterResponse?.Expiration || data.Expiration;
      const expirationTimestamp = expirationValue
        ? parseInt(expirationValue) * 1000
        : Date.now() + (years * 365 * 24 * 60 * 60 * 1000);

      return {
        success: true,
        orderId: orderIdValue,
        expirationDate: expirationTimestamp,
      };
    }

    const errorMessage = data.RegisterResponse?.Error || data.Error || "Registration failed";
    console.error(`[Dynadot Proxy] Registration failed:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  } catch (error) {
    console.error("[Dynadot Proxy] Registration error:", error);
    return { success: false, error: String(error) };
  }
  */
}

async function processOrder(supabase: any, customerId: string, pendingOrder: any) {
  const planId = pendingOrder.contact_info?.plan_id || null;
  const planCode = pendingOrder.contact_info?.plan_code || "basic";

  const { data: order } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      fqdn: pendingOrder.fqdn,
      years: 1,
      plan: planCode,
      plan_id: planId,
      total_cents: Math.round(pendingOrder.amount * 100),
      status: "completed",
      paypal_order_id: pendingOrder.paypal_order_id,
    })
    .select()
    .single();

  // Get the next display_order for this customer
  const { data: existingDomains } = await supabase
    .from("domains")
    .select("display_order")
    .eq("customer_id", customerId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextDisplayOrder = existingDomains && existingDomains.length > 0
    ? (existingDomains[0].display_order || 0) + 1
    : 1;

  const { data: domain } = await supabase
    .from("domains")
    .insert({
      customer_id: customerId,
      fqdn: pendingOrder.fqdn,
      registrar_status: "pending_provisioning",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      display_order: nextDisplayOrder,
    })
    .select()
    .single();

  if (IS_DEV) {
    console.log(`Order created successfully for ${pendingOrder.fqdn}`);
  }

  try {
    if (IS_DEV) {
      console.log(`[Registration] Starting Dynadot registration for ${pendingOrder.fqdn}`);
    }
    const registrationResult = await registerDomainWithDynadot(
      pendingOrder.fqdn,
      pendingOrder.contact_info || {},
      1
    );

    if (IS_DEV) {
      console.log(`[Registration] Dynadot result:`, JSON.stringify(registrationResult));
    }

    if (registrationResult.success) {
      const updateResult = await supabase
        .from("domains")
        .update({
          registrar_status: "active",
          registrar_id: registrationResult.orderId,
          expires_at: registrationResult.expirationDate
            ? new Date(registrationResult.expirationDate).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", domain.id);

      if (IS_DEV) {
        console.log(`[Registration] Database update result:`, JSON.stringify(updateResult));
        console.log(`Domain ${pendingOrder.fqdn} registered successfully with Dynadot`);
      }
    } else {
      await supabase
        .from("domains")
        .update({
          registrar_status: "failed",
        })
        .eq("id", domain.id);

      console.error(`Failed to register domain ${pendingOrder.fqdn}:`, registrationResult.error);
    }
  } catch (registrationError) {
    console.error(`[Registration] Exception during registration:`, registrationError);
    await supabase
      .from("domains")
      .update({
        registrar_status: "failed",
      })
      .eq("id", domain.id);
  }

  return { order, domain };
}
