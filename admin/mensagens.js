function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function carregar() {
  const st = document.getElementById('status');
  try {
    st.textContent = 'Carregando...';
    const d = await Admin.api('/api/admin/mensagens');
    const itens = d.mensagens || [];
    document.getElementById('lista').innerHTML = itens.map(m => `
      <article class="panel" data-key="${esc(m.key)}">
        <p class="eyebrow">${esc(m.tema)} · ${new Date(m.recebidoEm).toLocaleString('pt-BR')}</p>
        <h2>${esc(m.nome)}</h2>
        <p class="small muted">${esc(m.email || 'Sem e-mail')}</p>
        <p class="message">${esc(m.mensagem)}</p>
        <p class="small">AUTORIZA PUBLICAÇÃO: <strong>${m.autorizaPublicacao ? 'SIM' : 'NÃO'}</strong> · PUBLICADO: <strong>${m.publicado ? 'SIM' : 'NÃO'}</strong> · DESTAQUE: <strong>${m.destaque ? 'SIM' : 'NÃO'}</strong></p>
        <div class="actions">
          <button class="btn" onclick="acao('${encodeURIComponent(m.key)}','publicado',${!m.publicado})">${m.publicado ? 'DESPUBLICAR' : 'PUBLICAR'}</button>
          <button class="btn" onclick="acao('${encodeURIComponent(m.key)}','destaque',${!m.destaque})">${m.destaque ? 'REMOVER DESTAQUE' : 'DESTACAR'}</button>
          <button class="btn danger" onclick="remover('${encodeURIComponent(m.key)}')">EXCLUIR</button>
        </div>
      </article>
    `).join('') || '<section class="panel"><p class="muted">Nenhuma mensagem encontrada.</p></section>';
    st.textContent = `${itens.length} mensagem(ns).`;
  } catch (e) {
    st.className = 'status err';
    st.textContent = e.message;
  }
}

async function acao(key, campo, valor) {
  try {
    await Admin.api('/api/admin/mensagens', {
      method: 'PATCH',
      body: JSON.stringify({ key: decodeURIComponent(key), [campo]: valor })
    });
    carregar();
  } catch (e) { alert(e.message); }
}

async function remover(key) {
  if (!confirm('Excluir esta mensagem definitivamente?')) return;
  try {
    await Admin.api('/api/admin/mensagens', {
      method: 'DELETE',
      body: JSON.stringify({ key: decodeURIComponent(key) })
    });
    carregar();
  } catch (e) { alert(e.message); }
}

document.getElementById('reloadBtn').addEventListener('click', carregar);
Admin.setupAuth(carregar);
