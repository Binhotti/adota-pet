"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Check, Loader2, RotateCcw, X } from "lucide-react";

export function RequestActions({id,status,animalStatus,visitStatus}:{id:string;status:string;animalStatus:string;visitStatus?:string}){
  const router=useRouter();const[date,setDate]=useState("");const[location,setLocation]=useState("");const[note,setNote]=useState("");const[loading,setLoading]=useState("");const[error,setError]=useState("");
  async function act(action:string){setLoading(action);setError("");const normalizedDate=date?new Date(date).toISOString():"";const res=await fetch(`/api/requests/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,date:normalizedDate,location,note})});const result=await res.json().catch(()=>({}));setLoading("");if(!res.ok)return setError(result.error||"Não foi possível realizar a ação.");router.refresh()}
  const button=(action:string,label:string,className="")=><button className={className} onClick={()=>act(action)} disabled={!!loading}>{loading===action?<Loader2 className="spin"/>:label}</button>;
  return <div className="requestControl">
    {!["REJECTED","CANCELLED"].includes(status)&&animalStatus!=="ADOPTED"&&<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Observação para o adotante (opcional)" rows={2}/>} 
    <div className="requestActions">{status==="PENDING"&&button("under_review","Analisar")}{!["APPROVED","REJECTED","CANCELLED"].includes(status)&&<>{button("approve","Aprovar")}{button("reject","Recusar","danger")}</>}</div>
    {status==="APPROVED"&&animalStatus!=="ADOPTED"&&<div className="visitEditor"><b><CalendarCheck/>Agendar visita</b><input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Endereço da visita (privado)"/>{button("visit","Salvar visita")}{visitStatus&&visitStatus!=="CANCELLED"&&button("visit_cancel","Cancelar visita","danger")}</div>}
    {status==="APPROVED"&&animalStatus!=="ADOPTED"&&<div className="requestActions">{visitStatus&&["CONFIRMED","COMPLETED"].includes(visitStatus)&&button("adopted","Concluir adoção")}{visitStatus==="CONFIRMED"&&button("visit_completed","Visita realizada")}</div>}
    {animalStatus==="ADOPTED"&&status==="APPROVED"&&<button className="undoButton" onClick={()=>act("reopen")} disabled={!!loading}><RotateCcw/>Desfazer conclusão</button>}{error&&<p className="formError">{error}</p>}
  </div>;
}

export function AdopterRequestActions({id,status,visitStatus}:{id:string;status:string;visitStatus?:string}){
  const router=useRouter();const[loading,setLoading]=useState("");const[error,setError]=useState("");
  async function act(action:string){setLoading(action);setError("");const res=await fetch(`/api/requests/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});const result=await res.json().catch(()=>({}));setLoading("");if(!res.ok)return setError(result.error);router.refresh()}
  return <div className="adopterRequestActions">{visitStatus==="SCHEDULED"&&<><button onClick={()=>act("visit_confirm")}><Check/>Confirmar visita</button><button onClick={()=>act("visit_change")}><RotateCcw/>Pedir alteração</button></>}{!["CANCELLED","REJECTED"].includes(status)&&<button className="danger" onClick={()=>act("cancel")}><X/>Cancelar interesse</button>}{loading&&<Loader2 className="spin"/>}{error&&<small>{error}</small>}</div>;
}
