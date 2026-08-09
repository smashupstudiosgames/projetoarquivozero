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
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
      return json({ error: "Valor inválido." }, 400);
    }

    const token = await getAccessToken(context.env);
    const origin = new URL(context.request.url).origin;

    const r = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID()
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "ARQUIVO ZERO",
              locale: "pt-BR",
              user_action: "PAY_NOW",
              shipping_preference: "NO_SHIPPING",
              return_url: `${origin}/paypal-retorno.html`,
              cancel_url: `${origin}/cancelar.html`
            }
          }
        },
        purchase_units: [{
          description: "Apoio ao desenvolvimento de ARQUIVO Ø",
          amount: { currency_code: "USD", value: amount.toFixed(2) }
        }]
      })
    });

    const d = await r.json();
    if (!r.ok) return json({ error: "O PayPal recusou a criação da ordem." }, 502);

    const link = d.links?.find(x => x.rel === "payer-action") ||
                 d.links?.find(x => x.rel === "approve");

    if (!link?.href) return json({ error: "Link de aprovação não encontrado." }, 502);
    return json({ orderId: d.id, approveUrl: link.href });
  } catch (e) {
    return json({ error: e.message || "Erro interno." }, 500);
  }
}
