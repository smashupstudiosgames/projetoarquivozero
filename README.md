# ARQUIVO Ø v2.6 — PayPal Checkout Sandbox

Client ID Sandbox já configurado:
AQVY-Hqul9CWhXQ55lRoUjsRjcDDJtCXMGZmjI8h1nD_JaXS_ssfsYYcUEQCu1AgiRMLzEM5_0Y7uE5Q

O Client Secret NÃO está neste projeto.

No Cloudflare, crie um segredo/variável chamado:
PAYPAL_CLIENT_SECRET

Fluxo:
apoiar.html -> botão "CONTINUAR COM PAYPAL"
-> /api/paypal/create-order
-> PayPal abre com o valor selecionado
-> paypal-retorno.html
-> /api/paypal/capture-order
-> obrigado.html

Cancelamento:
PayPal -> cancelar.html

IMPORTANTE:
Esta versão usa Cloudflare Pages Functions. O upload estático simples por
arrastar e soltar não executa a pasta /functions.

Sem Git, publique com Wrangler a partir desta pasta:
npx wrangler pages deploy . --project-name=SEU_PROJETO

Fonte:
copie DK P_I_.ttf para assets/fonts/DK P_I_.ttf

Ambiente:
Sandbox. A API aponta para api-m.sandbox.paypal.com.
