import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
export const strongPassword=(value:string)=>value.length>=8&&/[A-Z]/.test(value)&&/[a-z]/.test(value)&&/\d/.test(value)&&/[^A-Za-z0-9]/.test(value);
export async function createAccountToken(email:string,purpose:"EMAIL_VERIFY"|"PASSWORD_RESET"){
  await prisma.verificationToken.deleteMany({where:{identifier:email,purpose}});
  const raw=randomBytes(32).toString("hex"),token=createHash("sha256").update(raw).digest("hex");
  await prisma.verificationToken.create({data:{identifier:email,token,purpose,expires:new Date(Date.now()+3600000)}});return raw;
}
export async function consumeAccountToken(raw:string,purpose:string){
  const token=createHash("sha256").update(raw).digest("hex"),record=await prisma.verificationToken.findUnique({where:{token}});
  if(!record||record.purpose!==purpose||record.expires<new Date())return null;
  await prisma.verificationToken.delete({where:{token}});return record.identifier;
}
