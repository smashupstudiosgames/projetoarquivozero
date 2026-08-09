document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const orderId = new URLSearchParams(location.search).get("token");
  if (!orderId) {
    status.textContent = "Não encontramos a identificação da transação.";
    return;
  }
  try {
    const response = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Falha ao confirmar.");
    location.replace("obrigado.html");
  } catch (err) {
    status.textContent = err.message || "Não foi possível confirmar a transação.";
  }
});
