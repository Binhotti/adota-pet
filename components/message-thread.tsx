"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

type ChatMessage={id:string;content:string;createdAt:string;mine:boolean;senderName:string};
export function MessageThread({requestId,messages}:{requestId:string;messages:ChatMessage[]}){
  const router=useRouter();const[text,setText]=useState("");const[loading,setLoading]=useState(false);const[error,setError]=useState("");
  async function send(event:FormEvent){event.preventDefault();if(!text.trim())return;setLoading(true);setError("");const res=await fetch(`/api/requests/${requestId}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:text})});const result=await res.json().catch(()=>({}));setLoading(false);if(!res.ok)return setError(result.error||"Não foi possível enviar.");setText("");router.refresh()}
  return <section className="messageThread"><h3>Conversa</h3><div className="messageList">{messages.length?messages.map(message=><div key={message.id} className={`messageBubble ${message.mine?"mine":"theirs"}`}><b>{message.mine?"Você":message.senderName}</b><p>{message.content}</p><small>{new Date(message.createdAt).toLocaleString("pt-BR")}</small></div>):<p className="emptyMessages">Envie a primeira mensagem para combinar os próximos passos.</p>}</div><form onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} maxLength={1000} rows={2} placeholder="Digite sua mensagem..."/><button disabled={loading||!text.trim()}>{loading?<Loader2 className="spin"/>:<Send/>}Enviar</button></form>{error&&<p className="formError">{error}</p>}</section>;
}
