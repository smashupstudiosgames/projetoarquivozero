export async function onRequestGet(context) {
  const { env } = context;

  if (!env.CONTADOR) {
    return Response.json(
      { error: "Binding CONTADOR não configurado." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const chave = "acessos_site";
  const atual = Number(await env.CONTADOR.get(chave) || 0);
  const proximo = atual + 1;

  await env.CONTADOR.put(chave, String(proximo));

  return Response.json(
    { acessos: proximo },
    { headers: { "Cache-Control": "no-store" } }
  );
}
