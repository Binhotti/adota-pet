import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(){const user=await getSession();if(!user)return NextResponse.json({error:"Acesso negado."},{status:401});const[count,items]=await Promise.all([prisma.notification.count({where:{userId:user.id,readAt:null}}),prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:5})]);return NextResponse.json({count,items:items.map(item=>({id:item.id,title:item.title,body:item.body,href:item.href,createdAt:item.createdAt.toISOString(),read:!!item.readAt}))})}
