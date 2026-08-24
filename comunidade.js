(() => {
  const container = document.getElementById("communityRecords");
  if (!container) return;

  const escapar = (valor) => {
    const el = document.createElement("div");
    el.textContent = String(valor ?? "");
    return el.innerHTML;
  };

  const dataPt = (iso) => {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(data);
  };

  async function carregar() {
    try {
      const response = await fetch("/api/elogios", {cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const registros = Array.isArray(data.registros) ? data.registros : [];

      if (!registros.length) {
        container.innerHTML = '<p class="community-empty">NOVOS REGISTROS SERÃO LIBERADOS APÓS MODERAÇÃO.</p>';
        return;
      }

      container.innerHTML = registros.map((r, i) => `
        <article class="community-card${r.destaque ? " featured" : ""}">
          <div class="community-meta">
            <span>REGISTRO Ø${String(i + 1).padStart(4, "0")}</span>
            <time datetime="${escapar(r.recebidoEm)}">${escapar(dataPt(r.recebidoEm))}</time>
          </div>
          <blockquote>“${escapar(r.mensagem)}”</blockquote>
          <p class="community-author">— ${escapar(r.nome)}</p>
          ${r.destaque ? '<span class="community-featured">DESTAQUE Ø</span>' : ""}
        </article>
      `).join("");
    } catch (erro) {
      console.error("Erro ao carregar registros da comunidade:", erro);
      container.innerHTML = '<p class="community-empty">REGISTROS TEMPORARIAMENTE INDISPONÍVEIS.</p>';
    }
  }

  carregar();
})();
