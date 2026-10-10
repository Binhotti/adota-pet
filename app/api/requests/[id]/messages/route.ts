import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorized(id:string,userId:string){const adoption=await prisma.adoptionRequest.findUnique({where:{id},include:{animal:true}});if(!adoption||!([adoption.adopterId,adoption.animal.guardianId].includes(userId)))return null;return adoption}

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const user=await getSession();if(!user)return NextResponse.json({error:"Acesso negado."},{status:401});const id=(await params).id;const adoption=await authorized(id,user.id);if(!adoption)return NextResponse.json({error:"Acesso negado."},{status:403});const messages=await prisma.message.findMany({where:{adoptionRequestId:id},include:{sender:true},orderBy:{createdAt:"asc"}});return NextResponse.json({messages:messages.map(message=>({id:message.id,content:message.content,createdAt:message.createdAt.toISOString(),mine:message.senderId===user.id,senderName:message.sender.name}))})}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getSession();if(!user)return NextResponse.json({error:"Entre na sua conta."},{status:401});
  const id=(await params).id;const adoption=await authorized(id,user.id);if(!adoption)return NextResponse.json({error:"Acesso negado."},{status:403});
  const ownerId=adoption.animal.guardianId;if(user.id!==adoption.adopterId&&user.id!==ownerId)return NextResponse.json({error:"Acesso negado."},{status:403});if(adoption.status!=="APPROVED")return NextResponse.json({error:"A conversa é liberada após a aprovação."},{status:403});
  const content=String((await request.json()).content??"").trim();if(!content||content.length>1000)return NextResponse.json({error:"Digite uma mensagem de até 1000 caracteres."},{status:400});const recipientId=user.id===adoption.adopterId?ownerId:adoption.adopterId;const href=`/chat/${id}`;
  await prisma.$transaction([prisma.message.create({data:{content,adoptionRequestId:id,senderId:user.id}}),prisma.notification.create({data:{userId:recipientId,title:`Nova mensagem sobre ${adoption.animal.name}`,body:`${user.name}: ${content.slice(0,120)}`,href}})]);return NextResponse.json({ok:true});
}
