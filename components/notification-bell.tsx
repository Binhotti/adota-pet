import Link from "next/link";
import { Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function NotificationBell({label=false}:{label?:boolean}){
  const user=await getSession();if(!user)return null;
  const count=await prisma.notification.count({where:{userId:user.id,readAt:null}});
  return <Link className={label?"notificationNav":"notificationBell"} href="/notificacoes" aria-label={`Notificações${count?`: ${count} não lidas`:""}`}><Bell/>{label&&<span>Notificações</span>}{count>0&&<b>{count>99?"99+":count}</b>}</Link>;
}
