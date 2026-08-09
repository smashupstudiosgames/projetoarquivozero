# ARQUIVO Ø v2.6 — PayPal Checkout Sandbox

Client ID Sandbox já configurado.

O Client Secret NÃO está neste projeto.

No Cloudflare, crie um segredo/variável.

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
Esta versão usa Cloudflare Pages Functions.

Esta é uma versão esperimental.
