import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getSession();if(!user)return NextResponse.json({error:"Entre na sua conta."},{status:401});
  const id=(await params).id;const adoption=await prisma.adoptionRequest.findUnique({where:{id},include:{animal:true}});if(!adoption)return NextResponse.json({error:"Solicitação não encontrada."},{status:404});
  const ownerId=adoption.animal.guardianId;if(user.id!==adoption.adopterId&&user.id!==ownerId)return NextResponse.json({error:"Acesso negado."},{status:403});if(adoption.status!=="APPROVED")return NextResponse.json({error:"A conversa é liberada após a aprovação."},{status:403});
  const content=String((await request.json()).content??"").trim();if(!content||content.length>1000)return NextResponse.json({error:"Digite uma mensagem de até 1000 caracteres."},{status:400});const recipientId=user.id===adoption.adopterId?ownerId:adoption.adopterId;const href=user.id===adoption.adopterId?"/painel/solicitacoes":"/interesses";
  await prisma.$transaction([prisma.message.create({data:{content,adoptionRequestId:id,senderId:user.id}}),prisma.notification.create({data:{userId:recipientId,title:`Nova mensagem sobre ${adoption.animal.name}`,body:`${user.name}: ${content.slice(0,120)}`,href}})]);return NextResponse.json({ok:true});
}
