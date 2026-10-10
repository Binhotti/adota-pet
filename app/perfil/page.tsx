import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/perfil");
  const user = await prisma.user.findUnique({ where: { id: session.id }, include: { organization: true } });
  if (!user) redirect("/login");
  return <main className="formPage"><section className="formShell">
    <Link className="backLink" href={user.role === "ADOPTER" ? "/interesses" : "/painel"}><ArrowLeft/>Voltar</Link>
    <span className="eyebrow"><UserRound size={16}/>Minha conta</span>
    <h1>Editar perfil</h1><p>Mantenha seus dados de contato e localização atualizados.</p>
    <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone ?? "", city: user.city ?? "", state: user.state ?? "", role: user.role, organizationName: user.organization?.name ?? "", organizationDescription: user.organization?.description ?? "" }}/>
  </section></main>;
}
