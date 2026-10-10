"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle } from "lucide-react";
export type NotificationItem={id:string;title:string;body:string;href:string;createdAt:string;read:boolean};
export function NotificationPopover({initialItems,initialCount}:{initialItems:NotificationItem[];initialCount:number}){
  const router=useRouter();const root=useRef<HTMLDivElement>(null);const[open,setOpen]=useState(false);const[items,setItems]=useState(initialItems);const[count,setCount]=useState(initialCount);
  useEffect(()=>{const close=(event:MouseEvent)=>{if(root.current&&!root.current.contains(event.target as Node))setOpen(false)};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close)},[]);
  useEffect(()=>{const load=async()=>{const res=await fetch("/api/notifications",{cache:"no-store"});if(res.ok){const data=await res.json();setItems(data.items);setCount(data.count)}};const timer=setInterval(load,5000);return()=>clearInterval(timer)},[]);
  async function visit(item:NotificationItem){await fetch("/api/notifications/read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id})});setOpen(false);setCount(current=>Math.max(0,current-(item.read?0:1)));router.push(item.href)}
  return <div className="notificationPopover" ref={root}><button className="notificationBell" onClick={()=>setOpen(!open)} aria-label={`Notificações${count?`: ${count} não lidas`:""}`}><Bell/>{count>0&&<b>{count>99?"99+":count}</b>}</button>{open&&<div className="notificationDropdown"><div className="notificationDropdownHead"><strong>Notificações</strong>{count>0&&<span>{count} nova{count===1?"":"s"}</span>}</div><div className="notificationPreviewList">{items.length?items.map(item=><button key={item.id} className={item.read?"":"unread"} onClick={()=>visit(item)}><span className="previewIcon">{item.href.startsWith("/chat/")?<MessageCircle/>:<Bell/>}</span><span><b>{item.title}</b><small>{item.body}</small><em>{item.href.startsWith("/chat/")?"Ver no chat":"Ver detalhes"}</em></span></button>):<p>Nenhuma notificação disponível.</p>}</div><Link href="/notificacoes" onClick={()=>setOpen(false)}>Ver todas as notificações</Link></div>}</div>;
}
