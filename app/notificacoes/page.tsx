import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationList } from "@/components/notification-list";
export default async function NotificationsPage(){const user=await getSession();if(!user)redirect("/login?redirect=/notificacoes");const items=await prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:100});return <main className="formPage"><section className="formShell wide"><Link className="backLink" href={user.role==="ADOPTER"?"/interesses":"/painel"}><ArrowLeft/>Voltar</Link><h1>Notificações</h1><p>Acompanhe mensagens, visitas e mudanças nas suas solicitações.</p><NotificationList items={items.map(i=>({id:i.id,title:i.title,body:i.body,href:i.href,createdAt:i.createdAt.toISOString(),read:!!i.readAt}))}/></section></main>}
