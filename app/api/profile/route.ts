import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { clearSession, createSession, getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request:Request){
  const session=await getSession();if(!session)return NextResponse.json({error:"Sessão expirada."},{status:401});
  const body=await request.json();const name=String(body.name??"").trim();const phone=String(body.phone??"").trim();const city=String(body.city??"").trim();const state=String(body.state??"").trim().toUpperCase();
  if(name.length<3||state.length>2)return NextResponse.json({error:"Confira o nome e o estado informado."},{status:400});
  const current=await prisma.user.findUnique({where:{id:session.id}});if(!current)return NextResponse.json({error:"Usuário não encontrado."},{status:404});
  let passwordHash:string|undefined;const newPassword=String(body.newPassword??"");
  if(newPassword){if(newPassword.length<8)return NextResponse.json({error:"A nova senha deve ter pelo menos 8 caracteres."},{status:400});if(!await verifyPassword(String(body.currentPassword??""),current.passwordHash))return NextResponse.json({error:"A senha atual está incorreta."},{status:400});passwordHash=await hashPassword(newPassword)}
  const user=await prisma.user.update({where:{id:session.id},data:{name,phone:phone||null,city:city||null,state:state||null,passwordHash,organization:session.role!=="ADOPTER"?{update:{name:String(body.organizationName??"").trim(),description:String(body.organizationDescription??"").trim()||null}}:undefined}});
  await createSession({id:user.id,name:user.name,email:user.email,role:user.role});return NextResponse.json({ok:true});
}

export async function DELETE(request:Request){
  const session=await getSession();if(!session)return NextResponse.json({error:"Sessão expirada."},{status:401});
  const {password}=await request.json();const user=await prisma.user.findUnique({where:{id:session.id},include:{animals:true}});if(!user)return NextResponse.json({error:"Usuário não encontrado."},{status:404});
  if(!await verifyPassword(String(password??""),user.passwordHash))return NextResponse.json({error:"Senha incorreta."},{status:400});
  const images=user.animals.flatMap(animal=>animal.imageUrls);await prisma.user.delete({where:{id:user.id}});if(images.length)await del(images).catch(console.error);await clearSession();return NextResponse.json({ok:true});
}
