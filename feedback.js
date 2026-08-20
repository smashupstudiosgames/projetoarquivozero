(() => {
  const form=document.getElementById("feedbackForm");
  if(!form)return;
  const msg=document.getElementById("feedbackMensagem"), chars=document.getElementById("feedbackChars");
  const status=document.getElementById("feedbackStatus"), enviar=document.getElementById("feedbackEnviar");
  const count=()=>chars.textContent=String(msg.value.length);
  msg.addEventListener("input",count);
  form.addEventListener("reset",()=>setTimeout(()=>{count();status.textContent="";status.className="feedback-status"},0));
  form.addEventListener("submit",async e=>{
    e.preventDefault(); if(!form.reportValidity())return;
    enviar.disabled=true; enviar.textContent="ENVIANDO...";
    status.textContent=""; status.className="feedback-status";
    try{
      const r=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||"Não foi possível enviar o feedback.");
      form.reset(); status.textContent="FEEDBACK REGISTRADO. OBRIGADO POR PARTICIPAR DO ARQUIVO Ø."; status.classList.add("success");
    }catch(err){status.textContent=err.message||"ERRO AO ENVIAR.";status.classList.add("error")}
    finally{enviar.disabled=false;enviar.textContent="ENVIAR"}
  }); count();
})();
