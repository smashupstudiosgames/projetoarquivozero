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
