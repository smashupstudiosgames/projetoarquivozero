export async function onRequestGet({ env }) {
  if (!env.CONTADOR) {
    return Response.json(
      { error: "Binding CONTADOR não configurado." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const total = Number(await env.CONTADOR.get("acessos_site") || 0);

  const paises = await listarContagens(env.CONTADOR, "geo:pais:");
  const regioesBrutas = await listarContagens(env.CONTADOR, "geo:regiao:");
  const nomesRegiao = await listarValores(env.CONTADOR, "geo:regiao_nome:");

  const regioesPorPais = {};

  for (const item of regioesBrutas) {
    const resto = item.chave.slice("geo:regiao:".length);
    const separador = resto.indexOf(":");
    if (separador === -1) continue;

    const pais = resto.slice(0, separador);
    const codigo = resto.slice(separador + 1);

    if (!regioesPorPais[pais]) regioesPorPais[pais] = [];

    const nome =
      nomesRegiao[`geo:regiao_nome:${pais}:${codigo}`] ||
      codigo.replaceAll("_", " ");

    regioesPorPais[pais].push({
      codigo,
      nome,
      acessos: item.acessos
    });
  }

  for (const lista of Object.values(regioesPorPais)) {
    lista.sort((a, b) => b.acessos - a.acessos || a.nome.localeCompare(b.nome));
  }

  paises.sort((a, b) => b.acessos - a.acessos || a.chave.localeCompare(b.chave));

  return Response.json(
    {
      total,
      paises: paises.map(item => ({
        codigo: item.chave.slice("geo:pais:".length),
        acessos: item.acessos
      })),
      regioes: regioesPorPais,
      atualizadoEm: new Date().toISOString()
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

async function listarContagens(kv, prefix) {
  const resultado = [];
  let cursor;

  do {
    const pagina = await kv.list({ prefix, cursor, limit: 1000 });

    for (const item of pagina.keys) {
      const valor = Number(await kv.get(item.name) || 0);
      resultado.push({ chave: item.name, acessos: valor });
    }

    cursor = pagina.list_complete ? undefined : pagina.cursor;
  } while (cursor);

  return resultado;
}

async function listarValores(kv, prefix) {
  const resultado = {};
  let cursor;

  do {
    const pagina = await kv.list({ prefix, cursor, limit: 1000 });

    for (const item of pagina.keys) {
      resultado[item.name] = await kv.get(item.name);
    }

    cursor = pagina.list_complete ? undefined : pagina.cursor;
  } while (cursor);

  return resultado;
}
