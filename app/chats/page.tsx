import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ChatsPage(){
  const user=await getSession();if(!user)redirect("/login?redirect=/chats");
  const conversations=await prisma.adoptionRequest.findMany({where:{status:"APPROVED",OR:[{adopterId:user.id},{animal:{guardianId:user.id}}]},include:{adopter:true,animal:{include:{guardian:{include:{organization:true}}}},messages:{orderBy:{createdAt:"desc"},take:1}},orderBy:{updatedAt:"desc"}});
  return <main className="formPage"><section className="formShell wide"><Link className="backLink" href={user.role==="ADOPTER"?"/interesses":"/painel"}><ArrowLeft/>Voltar</Link><div className="chatsHeading"><div><span className="eyebrow"><MessageCircle/>Mensagens</span><h1>Chats</h1><p>Suas conversas sobre processos de adoção.</p></div></div>{conversations.length?<div className="chatInbox">{conversations.map(item=>{const isAdopter=user.id===item.adopterId;const otherName=isAdopter?(item.animal.guardian.organization?.name??item.animal.guardian.name):item.adopter.name;const last=item.messages[0];return <Link href={`/chat/${item.id}`} key={item.id}><div className="chatAvatar">{otherName.slice(0,2).toUpperCase()}</div><div className="chatInboxBody"><div><h2>{otherName}</h2><span>sobre {item.animal.name}</span></div><p>{last?last.content:"Conversa liberada. Envie a primeira mensagem."}</p><small><MapPin/>{item.animal.city} - {item.animal.state}</small></div>{item.animal.imageUrls[0]&&<div className="chatAnimalImage"><Image src={item.animal.imageUrls[0]} alt={item.animal.name} fill sizes="70px"/></div>}<MessageCircle className="chatArrow"/></Link>})}</div>:<div className="panelEmpty"><MessageCircle/><h2>Nenhuma conversa disponível</h2><p>O chat será liberado quando uma solicitação de adoção for aprovada.</p></div>}</section></main>;
}
