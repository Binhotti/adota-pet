import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, Heart, Mail, MapPin, PawPrint, Phone, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AdopterRequestActions } from "@/components/request-actions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusLabel:Record<string,string>={PENDING:"Aguardando análise",UNDER_REVIEW:"Em análise",APPROVED:"Aprovada",REJECTED:"Não aprovada",CANCELLED:"Cancelada"};
const eventLabel:Record<string,string>={UNDER_REVIEW:"Análise iniciada",APPROVED:"Solicitação aprovada",REJECTED:"Solicitação recusada",CANCELLED:"Interesse cancelado",VISIT_SCHEDULED:"Visita agendada",VISIT_CONFIRMED:"Visita confirmada",VISIT_CHANGE_REQUESTED:"Nova data solicitada",VISIT_CANCELLED:"Visita cancelada",VISIT_COMPLETED:"Visita realizada",ADOPTED:"Adoção concluída",REOPENED:"Processo reaberto"};
export default async function InterestsPage(){
  const user=await getSession();if(!user)redirect("/login?role=ADOPTER&redirect=/interesses");if(user.role!=="ADOPTER")redirect("/painel");
  const requests=await prisma.adoptionRequest.findMany({where:{adopterId:user.id},include:{animal:{include:{guardian:{include:{organization:true}}}},visit:true,history:{orderBy:{createdAt:"desc"}}},orderBy:{createdAt:"desc"}});
  return <main><SiteHeader/><section className="container interestsPage"><div className="interestsHeader"><div><span className="eyebrow"><Heart size={16}/>Área do adotante</span><h1>Olá, {user.name.split(" ")[0]}</h1><p>Acompanhe seus pedidos de adoção e visitas.</p></div><Link className="button outline small" href="/perfil"><UserRound/>Editar perfil</Link></div>
  {requests.length?<div className="interestList">{requests.map(r=><article key={r.id} className="interestCard"><div className="interestTop"><div><PawPrint/><div><Link href={`/animais/${r.animal.slug}`}><h2>{r.animal.name}</h2></Link><span>{r.animal.city} - {r.animal.state}</span></div></div><b>{statusLabel[r.status]}</b></div>
  {r.decisionNote&&<p className="decisionNote">Mensagem do responsável: {r.decisionNote}</p>}
  {r.status==="APPROVED"&&<div className="privateContact"><b>Contato do responsável</b><span><Mail/>{r.animal.guardian.email}</span>{r.animal.guardian.phone&&<a href={`https://wa.me/55${r.animal.guardian.phone.replace(/\D/g,"")}`} target="_blank"><Phone/>{r.animal.guardian.phone} · conversar no WhatsApp</a>}<small>{r.animal.guardian.organization?.name??r.animal.guardian.name}</small></div>}
  {r.visit&&r.status==="APPROVED"&&<div className="visitInfo"><b>Visita: {r.visit.status}</b>{r.visit.scheduledAt&&<span><Clock3/>{r.visit.scheduledAt.toLocaleString("pt-BR")}</span>}{r.visit.location&&<span><MapPin/>{r.visit.location}</span>}{r.visit.notes&&<small>{r.visit.notes}</small>}</div>}
  <details className="requestHistory"><summary>Histórico da solicitação</summary><ol>{r.history.map(h=><li key={h.id}><b>{eventLabel[h.action]??h.action}</b><span>{h.createdAt.toLocaleString("pt-BR")}</span>{h.message&&<p>{h.message}</p>}</li>)}<li><b>Interesse enviado</b><span>{r.createdAt.toLocaleString("pt-BR")}</span></li></ol></details><AdopterRequestActions id={r.id} status={r.status} visitStatus={r.visit?.status}/></article>)}</div>:<div className="panelEmpty"><Heart/><h2>Você ainda não demonstrou interesse</h2><p>Encontre um amigo e envie uma solicitação para a ONG ou protetor responsável.</p><Link className="button green" href="/animais">Conhecer animais</Link></div>}</section></main>;
}
