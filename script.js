document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  const accessCount = document.getElementById("accessCount");

  async function carregarContador() {
    if (!accessCount) return;
    try {
      const response = await fetch("/api/contador", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const total = Number(data.acessos);
      if (!Number.isFinite(total)) throw new Error("Resposta inválida.");
      accessCount.textContent = String(total).padStart(6, "0");
    } catch (error) {
      console.error("Erro no contador:", error);
      accessCount.textContent = "------";
    }
  }

  carregarContador();
});

// ======================================================
// SOM AMBIENTE
// ======================================================

const ambientSound = document.getElementById("ambientSound");
const soundToggle = document.getElementById("soundToggle");

if (ambientSound && soundToggle) {

  ambientSound.volume = 0.35;

  function atualizarBotao() {
    soundToggle.textContent = ambientSound.paused
      ? "🔇 SOM"
      : "🔊 SOM";
  }

  // Tenta autoplay
  ambientSound.play()
    .then(atualizarBotao)
    .catch(() => {
      atualizarBotao();
      console.log("Autoplay bloqueado. Aguardando interação do usuário.");
    });

  // Se autoplay for bloqueado, primeira interação inicia o ambiente
  function iniciarNaPrimeiraInteracao() {
    if (ambientSound.paused) {
      ambientSound.play()
        .then(() => {
          atualizarBotao();

          document.removeEventListener(
            "click",
            iniciarNaPrimeiraInteracao
          );

          document.removeEventListener(
            "keydown",
            iniciarNaPrimeiraInteracao
          );
        })
        .catch(() => {});
    }
  }

  document.addEventListener(
    "click",
    iniciarNaPrimeiraInteracao
  );

  document.addEventListener(
    "keydown",
    iniciarNaPrimeiraInteracao
  );

  // Botão SOM
  soundToggle.addEventListener("click", (event) => {

    // Impede que este clique também seja tratado
    // como a "primeira interação"
    event.stopPropagation();

    if (ambientSound.paused) {
      ambientSound.play()
        .then(atualizarBotao)
        .catch(console.error);
    } else {
      ambientSound.pause();
      atualizarBotao();
    }
  });

  atualizarBotao();
}