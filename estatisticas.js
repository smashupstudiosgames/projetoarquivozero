document.addEventListener("DOMContentLoaded", () => {
  const totalEl = document.getElementById("statsTotal");
  const countriesEl = document.getElementById("statsCountries");
  const regionsEl = document.getElementById("statsRegions");
  const countriesCountEl = document.getElementById("statsCountriesCount");
  const regionHintEl = document.getElementById("statsRegionHint");
  const updatedEl = document.getElementById("statsUpdated");
  const reloadButton = document.getElementById("statsReload");

  const nomesPaises = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["pt-BR"], { type: "region" })
    : null;

  let dadosAtuais = null;
  let paisSelecionado = null;

  function nomePais(codigo) {
    if (codigo === "DESCONHECIDO") return "Desconhecido";
    try { return nomesPaises?.of(codigo) || codigo; } catch { return codigo; }
  }

  function formatarNumero(valor) {
    return new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);
  }

  function linha({ rotulo, acessos, codigo, selecionavel = false }) {
    const elemento = document.createElement(selecionavel ? "button" : "div");
    elemento.className = "stats-row";
    if (selecionavel) elemento.type = "button";
    if (selecionavel && codigo === paisSelecionado) elemento.classList.add("active");
    if (codigo) elemento.dataset.codigo = codigo;

    const nome = document.createElement("span");
    nome.className = "stats-row-name";
    nome.textContent = rotulo;

    const valor = document.createElement("strong");
    valor.textContent = formatarNumero(acessos);

    elemento.append(nome, valor);
    return elemento;
  }

  function renderPaises() {
    const paises = dadosAtuais?.paises || [];
    countriesEl.replaceChildren();
    countriesCountEl.textContent = `${paises.length} ${paises.length === 1 ? "PAÍS" : "PAÍSES"}`;

    if (!paises.length) {
      countriesEl.innerHTML = '<p class="stats-empty">AINDA NÃO HÁ DADOS GEOGRÁFICOS.</p>';
      return;
    }

    for (const pais of paises) {
      const el = linha({ rotulo: nomePais(pais.codigo), acessos: pais.acessos, codigo: pais.codigo, selecionavel: true });
      el.addEventListener("click", () => {
        paisSelecionado = pais.codigo;
        renderPaises();
        renderRegioes();
      });
      countriesEl.appendChild(el);
    }
  }

  function renderRegioes() {
    regionsEl.replaceChildren();

    if (!paisSelecionado) {
      regionHintEl.textContent = "SELECIONE UM PAÍS";
      regionsEl.innerHTML = '<p class="stats-empty">Selecione um país para consultar suas regiões.</p>';
      return;
    }

    const pais = nomePais(paisSelecionado);
    const regioes = dadosAtuais?.regioes?.[paisSelecionado] || [];
    regionHintEl.textContent = pais.toUpperCase();

    if (!regioes.length) {
      regionsEl.innerHTML = '<p class="stats-empty">NENHUMA REGIÃO REGISTRADA PARA ESTE PAÍS.</p>';
      return;
    }

    for (const regiao of regioes) {
      regionsEl.appendChild(linha({ rotulo: regiao.nome || regiao.codigo, acessos: regiao.acessos }));
    }
  }

  async function carregar() {
    reloadButton.disabled = true;
    reloadButton.textContent = "ATUALIZANDO...";

    try {
      const response = await fetch("/api/estatisticas", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      dadosAtuais = await response.json();
      totalEl.textContent = String(Number(dadosAtuais.total) || 0).padStart(6, "0");

      const paises = dadosAtuais.paises || [];
      if (!paisSelecionado && paises.length) paisSelecionado = paises[0].codigo;

      renderPaises();
      renderRegioes();

      const data = new Date(dadosAtuais.atualizadoEm);
      updatedEl.textContent = `ÚLTIMA LEITURA: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(data)}`;
    } catch (erro) {
      console.error("Erro ao carregar estatísticas:", erro);
      countriesEl.innerHTML = '<p class="stats-error">NÃO FOI POSSÍVEL CARREGAR AS ESTATÍSTICAS.</p>';
      regionsEl.innerHTML = '<p class="stats-error">VERIFIQUE O ACESSO E A CONFIGURAÇÃO DO ENDPOINT.</p>';
    } finally {
      reloadButton.disabled = false;
      reloadButton.textContent = "ATUALIZAR";
    }
  }

  reloadButton.addEventListener("click", carregar);
  carregar();
});
