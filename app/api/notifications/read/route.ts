import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function POST(request:Request){const user=await getSession();if(!user)return NextResponse.json({error:"Acesso negado."},{status:401});const{id,href}=await request.json().catch(()=>({}));await prisma.notification.updateMany({where:{userId:user.id,...(id?{id:String(id)}:href?{href:String(href)}:{readAt:null})},data:{readAt:new Date()}});return NextResponse.json({ok:true})}
