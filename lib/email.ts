export const appUrl=()=>process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000";
export async function sendEmail(to:string,subject:string,html:string){
  if(!process.env.RESEND_API_KEY){console.warn("RESEND_API_KEY não configurada; e-mail não enviado para",to);return false;}
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.EMAIL_FROM??"AdotaPet <onboarding@resend.dev>",to,subject,html})});
  if(!response.ok)console.error("Falha no envio de e-mail",await response.text());
  return response.ok;
}
