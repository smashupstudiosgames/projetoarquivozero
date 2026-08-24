export async function onRequestGet({env}) {
  if (!env.FEEDBACK) {
    return Response.json({error:"O armazenamento de feedback ainda não foi configurado."},{status:500});
  }

  const itens = [];
  let cursor;

  do {
    const pagina = await env.FEEDBACK.list({
      prefix: "feedback:",
      cursor,
      limit: 1000
    });

    for (const chave of pagina.keys) {
      const registro = await env.FEEDBACK.get(chave.name, "json");
      if (
        registro &&
        registro.tema === "ELOGIO" &&
        registro.autorizaPublicacao === true &&
        registro.publicado === true
      ) {
        itens.push({
          id: registro.id,
          nome: registro.nome,
          mensagem: registro.mensagem,
          recebidoEm: registro.recebidoEm,
          destaque: registro.destaque === true
        });
      }
    }

    cursor = pagina.list_complete ? undefined : pagina.cursor;
  } while (cursor);

  itens.sort((a,b) => {
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
    return new Date(b.recebidoEm) - new Date(a.recebidoEm);
  });

  return Response.json(
    {registros: itens.slice(0, 50)},
    {headers: {"Cache-Control":"public, max-age=60"}}
  );
}
