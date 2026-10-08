async function atualizarStatusMensagens() {
    const status = document.getElementById("status");

    if (!status) return;

    try {
        const dados = await Admin.api("/api/admin/mensagens");
        const mensagens = dados.mensagens || [];

        const pendentes = mensagens.filter(
            mensagem => !mensagem.publicado
        );

        status.textContent = pendentes.length === 0
            ? "Nenhuma mensagem pendente."
            : `${pendentes.length} mensagem(ns) aguardando aprovação.`;

    } catch (erro) {
        console.error("Erro ao consultar mensagens:", erro);
        status.textContent = "Não foi possível consultar as mensagens.";
    }
}

Admin.setupAuth(atualizarStatusMensagens);