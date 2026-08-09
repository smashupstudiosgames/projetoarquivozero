const PAYPAL_CLIENT_ID = "AQVY-Hqul9CWhXQ55lRoUjsRjcDDJtCXMGZmjI8h1nD_JaXS_ssfsYYcUEQCu1AgiRMLzEM5_0Y7uE5Q";
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

async function getAccessToken(env) {
  if (!env.PAYPAL_CLIENT_SECRET) throw new Error("PAYPAL_CLIENT_SECRET não configurado.");
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const r = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error("Falha ao autenticar no PayPal Sandbox.");
  return d.access_token;
}

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const orderId = String(body.orderId || "").trim();
    if (!/^[A-Z0-9]+$/i.test(orderId)) return json({ error: "Ordem inválida." }, 400);

    const token = await getAccessToken(context.env);
    const r = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID()
      },
      body: "{}"
    });

    const d = await r.json();
    if (!r.ok) return json({ error: "O PayPal não confirmou o pagamento." }, 502);

    const ok = d.status === "COMPLETED" ||
      d.purchase_units?.some(u => u.payments?.captures?.some(c => c.status === "COMPLETED"));

    if (!ok) return json({ error: "A transação ainda não foi concluída." }, 409);
    return json({ ok: true, orderId: d.id });
  } catch (e) {
    return json({ error: e.message || "Erro interno." }, 500);
  }
}
