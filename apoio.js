document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  const amountButtons = [...document.querySelectorAll(".amount-button")];
  const customBox = document.querySelector(".custom-amount");
  const customInput = document.getElementById("customValue");
  const selectedAmount = document.getElementById("selectedAmount");
  const paypalButton = document.getElementById("paypalButton");
  const paymentStatus = document.getElementById("paymentStatus");
  const pixTab = document.getElementById("pixTab");
  const paypalTab = document.getElementById("paypalTab");
  const pixPanel = document.getElementById("pixPanel");
  const paypalPanel = document.getElementById("paypalPanel");
  const copyPixButton = document.getElementById("copyPixButton");
  const pixStatus = document.getElementById("pixStatus");
  const PIX_COPIA_E_COLA = "00020126970014BR.GOV.BCB.PIX01367276c08d-c107-4b06-8600-6f2b7116c4fd0235Apoio ao desenvolvimento do projeto5204000053039865802BR5923Hilton Carneiro Almeida6009SAO PAULO62140510AIbaJDlasK63042F31";


  const PAYPAL_CLIENT_ID = "AQVY-Hqul9CWhXQ55lRoUjsRjcDDJtCXMGZmjI8h1nD_JaXS_ssfsYYcUEQCu1AgiRMLzEM5_0Y7uE5Q";
  const CURRENCY = "USD";
  let value = null;
  let processing = false;

  if (year) year.textContent = new Date().getFullYear();

  function setActiveButton(activeButton) {
    amountButtons.forEach(button =>
      button.classList.toggle("selected", button === activeButton)
    );
  }

  function setValue(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1 || n > 10000) {
      value = null;
      selectedAmount.textContent = "Selecione um valor";
      paypalButton.disabled = true;
      return;
    }
    value = Number(n.toFixed(2));
    selectedAmount.textContent = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: CURRENCY
    }).format(value);
    paypalButton.disabled = false;
    paymentStatus.textContent = "";
  }

  amountButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.value;
      setActiveButton(button);
      if (selected === "custom") {
        customBox.hidden = false;
        customInput.focus();
        setValue(customInput.value);
      } else {
        customBox.hidden = true;
        customInput.value = "";
        setValue(selected);
      }
    });
  });

  customInput.addEventListener("input", () => setValue(customInput.value));

  function showPaymentMethod(method) {
    const pix = method === "pix";
    pixPanel.hidden = !pix;
    paypalPanel.hidden = pix;
    pixTab.classList.toggle("selected", pix);
    paypalTab.classList.toggle("selected", !pix);
    pixTab.setAttribute("aria-selected", String(pix));
    paypalTab.setAttribute("aria-selected", String(!pix));
  }

  pixTab.addEventListener("click", () => showPaymentMethod("pix"));
  paypalTab.addEventListener("click", () => showPaymentMethod("paypal"));

  copyPixButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(PIX_COPIA_E_COLA);
      copyPixButton.textContent = "PIX COPIADO ✓";
      pixStatus.textContent = "Código PIX copiado.";
      setTimeout(() => {
        copyPixButton.textContent = "COPIAR PIX";
        pixStatus.textContent = "";
      }, 2500);
    } catch {
      pixStatus.textContent = "Não foi possível copiar automaticamente.";
    }
  });

  paypalButton.addEventListener("click", async () => {
    if (!value || processing) return;

    processing = true;
    paypalButton.disabled = true;
    paypalButton.textContent = "ABRINDO O PAYPAL...";

    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, currency: CURRENCY })
      });
      const data = await response.json();
      if (!response.ok || !data.approveUrl) {
        throw new Error(data.error || "Não foi possível iniciar o pagamento.");
      }
      window.location.href = data.approveUrl;
    } catch (err) {
      paymentStatus.textContent = err.message || "Falha ao abrir o PayPal.";
      processing = false;
      paypalButton.disabled = !value;
      paypalButton.textContent = "CONTINUAR COM PAYPAL";
    }
  });
});
