const TEMAS=new Set(["SUGESTÃO","CRÍTICA","CURIOSIDADE","ELOGIO","RELATO DE BUG","OUTRO"]);
export async function onRequestPost({request,env}){
  if(!env.FEEDBACK)return Response.json({error:"O armazenamento de feedback ainda não foi configurado."},{status:500});
  let b; try{b=await request.json()}catch{return Response.json({error:"Dados inválidos."},{status:400})}
  const nome=String(b.nome||"").trim().slice(0,80), email=String(b.email||"").trim().slice(0,120);
  const tema=String(b.tema||"").trim(), mensagem=String(b.mensagem||"").trim().slice(0,3000);
  if(!nome||!mensagem||!TEMAS.has(tema))return Response.json({error:"Preencha nome, tema e mensagem."},{status:400});
  if(email&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))return Response.json({error:"E-mail inválido."},{status:400});
  const id=crypto.randomUUID(), recebidoEm=new Date().toISOString();
  await env.FEEDBACK.put(`feedback:${recebidoEm}:${id}`,JSON.stringify({id,nome,email:email||null,tema,mensagem,recebidoEm}));
  return Response.json({ok:true,id},{headers:{"Cache-Control":"no-store"}});
}
