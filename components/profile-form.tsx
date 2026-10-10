"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";

type Profile = { name:string;email:string;phone:string;city:string;state:string;role:string;organizationName:string;organizationDescription:string };
export function ProfileForm({user}:{user:Profile}) {
  const router=useRouter(); const[loading,setLoading]=useState(false); const[message,setMessage]=useState(""); const[error,setError]=useState(""); const[show,setShow]=useState(false);const[deleteMode,setDeleteMode]=useState(false);const[deletePassword,setDeletePassword]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setError("");setMessage("");const data=Object.fromEntries(new FormData(event.currentTarget));const res=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await res.json();setLoading(false);if(!res.ok)return setError(result.error);setMessage("Perfil atualizado com sucesso.");router.refresh()}
  return <form className="animalForm" onSubmit={submit}><div className="formGrid">
    <label><span>Nome</span><input name="name" defaultValue={user.name} required minLength={3}/></label>
    <label><span>E-mail</span><input value={user.email} disabled/></label>
    <label><span>Telefone / WhatsApp</span><input name="phone" defaultValue={user.phone} placeholder="(47) 99999-9999"/></label>
    <label><span>Cidade</span><input name="city" defaultValue={user.city}/></label>
    <label><span>Estado</span><input name="state" defaultValue={user.state} maxLength={2} placeholder="SC"/></label>
    {user.role!=="ADOPTER"&&<label><span>Nome da ONG/projeto</span><input name="organizationName" defaultValue={user.organizationName} required/></label>}
  </div>
  {user.role!=="ADOPTER"&&<label><span>Sobre a organização</span><textarea name="organizationDescription" defaultValue={user.organizationDescription} rows={4}/></label>}
  <div className="passwordUpdate"><label><span>Senha atual</span><div><input name="currentPassword" type={show?"text":"password"}/><button type="button" onClick={()=>setShow(!show)} aria-label="Mostrar senha">{show?<EyeOff/>:<Eye/>}</button></div></label><label><span>Nova senha</span><input name="newPassword" type={show?"text":"password"} minLength={8}/></label></div>
  <small className="fieldHint">Deixe as senhas vazias se não quiser alterá-las.</small>{error&&<p className="formError">{error}</p>}{message&&<p className="formSuccess">{message}</p>}<button className="button green" disabled={loading}>{loading?<Loader2 className="spin"/>:<><Save/>Salvar alterações</>}</button>
  <section className="dangerZone"><h2>Excluir conta</h2><p>Esta ação apaga permanentemente sua conta e os dados vinculados.</p>{deleteMode?<div><input type="password" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} placeholder="Digite sua senha para confirmar"/><button type="button" onClick={async()=>{if(!confirm("Deseja realmente excluir sua conta? Esta ação não pode ser desfeita."))return;const res=await fetch("/api/profile",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:deletePassword})});const result=await res.json();if(!res.ok)return setError(result.error);router.push("/");router.refresh()}}>Excluir definitivamente</button><button type="button" onClick={()=>setDeleteMode(false)}>Cancelar</button></div>:<button type="button" onClick={()=>setDeleteMode(true)}>Quero excluir minha conta</button>}</section></form>;
}
