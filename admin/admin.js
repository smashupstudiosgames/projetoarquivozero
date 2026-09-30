const Admin = (() => {
  const KEY = "arquivozero_admin_token";
  const getToken = () => sessionStorage.getItem(KEY) || "";
  const setToken = token => sessionStorage.setItem(KEY, token.trim());
  const clearToken = () => sessionStorage.removeItem(KEY);
  async function api(url, options={}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type","application/json");
    const response = await fetch(url,{...options,headers,cache:"no-store"});
    let data={}; try{data=await response.json()}catch{}
    if(!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }
  function setupAuth(onReady){
    const gate=document.getElementById("authGate"), app=document.getElementById("adminApp"), input=document.getElementById("adminToken"), form=document.getElementById("authForm"), sair=document.getElementById("logoutBtn");
    const show=()=>{const ok=!!getToken(); gate?.classList.toggle("hidden",ok); app?.classList.toggle("hidden",!ok); if(ok) onReady?.();};
    form?.addEventListener("submit",e=>{e.preventDefault();setToken(input.value);show();});
    sair?.addEventListener("click",()=>{clearToken();location.reload();});
    show();
  }
  return {api,setupAuth,getToken};
})();
