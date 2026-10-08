// Contador exclusivo do cartão MENSAGENS no painel administrativo.
(async function atualizarStatusMensagens() {
  const status = document.getElementById('status');
  if (!status) return;

  // A API exige o token que é informado na tela de Mensagens.
  if (!Admin.getToken()) {
    status.textContent = 'Entre em MENSAGENS para consultar as pendências.';
    return;
  }

  status.textContent = 'Consultando mensagens...';
  try {
    const dados = await Admin.api('/api/admin/mensagens');
    const mensagens = Array.isArray(dados.mensagens) ? dados.mensagens : [];
    const pendentes = mensagens.filter(m => !m.publicado).length;
    status.textContent = pendentes === 0
      ? 'Nenhuma mensagem aguardando aprovação.'
      : `${pendentes} ${pendentes === 1 ? 'mensagem aguardando' : 'mensagens aguardando'} aprovação.`;
  } catch (erro) {
    console.error('Erro ao consultar mensagens:', erro);
    status.textContent = 'Não foi possível consultar as mensagens. Abra MENSAGENS para autenticar.';
  }
})();
