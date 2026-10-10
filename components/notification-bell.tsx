import Link from "next/link";
import { Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationPopover } from "@/components/notification-popover";

export async function NotificationBell({label=false}:{label?:boolean}){
  const user=await getSession();if(!user)return null;
  const[count,items]=await Promise.all([prisma.notification.count({where:{userId:user.id,readAt:null}}),prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:5})]);
  if(label)return <Link className="notificationNav" href="/notificacoes"><Bell/><span>Notificações</span>{count>0&&<b>{count>99?"99+":count}</b>}</Link>;
  return <NotificationPopover initialCount={count} initialItems={items.map(item=>({id:item.id,title:item.title,body:item.body,href:item.href,createdAt:item.createdAt.toISOString(),read:!!item.readAt}))}/>;
}
