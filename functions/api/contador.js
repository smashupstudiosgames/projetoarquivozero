export async function onRequestGet(context) {
  const { env, request } = context;

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

  // Estatísticas geográficas agregadas. Nenhum IP é armazenado.
  const cf = request.cf || {};
  const pais = normalizarParte(cf.country, "DESCONHECIDO");
  const regiao = normalizarParte(cf.regionCode || cf.region, "DESCONHECIDA");
  const nomeRegiao = String(cf.region || cf.regionCode || "Desconhecida").trim().slice(0, 100);

  await incrementar(env.CONTADOR, `geo:pais:${pais}`);

  if (pais !== "DESCONHECIDO") {
    await incrementar(env.CONTADOR, `geo:regiao:${pais}:${regiao}`);

    if (regiao !== "DESCONHECIDA") {
      await env.CONTADOR.put(
        `geo:regiao_nome:${pais}:${regiao}`,
        nomeRegiao
      );
    }
  }

  return Response.json(
    { acessos: proximo },
    { headers: { "Cache-Control": "no-store" } }
  );
}

async function incrementar(kv, chave) {
  const atual = Number(await kv.get(chave) || 0);
  await kv.put(chave, String(atual + 1));
}

function normalizarParte(valor, fallback) {
  const texto = String(valor || "").trim();
  if (!texto) return fallback;

  return texto
    .normalize("NFKD")
    .replace(/[^\w-]/g, "_")
    .slice(0, 80);
}
