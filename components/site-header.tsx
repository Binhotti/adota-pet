import Link from "next/link";
import { Building2, Heart, LogOut, Menu, MessageCircle, PawPrint, UserRound } from "lucide-react";
import { getSession } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";

export async function SiteHeader() {
  const user = await getSession();
  const isOrganization = user?.role === "NGO" || user?.role === "PROTECTOR";
  const firstName = user?.name.split(" ")[0];
  return <header className="header container"><Link className="logo" href="/"><PawPrint/><span>Adota</span><strong>Pet</strong></Link><nav><Link href="/">Início</Link><Link href="/animais">Animais</Link><Link href="/#como-adotar">Como adotar</Link><Link href="/#ongs">ONGs/Protetores</Link></nav>{user?<div className="headerActions loggedActions"><Link className="userGreeting" href="/perfil"><UserRound/>Olá, <strong>{firstName}</strong></Link><Link className="chatHeaderButton" href="/chats" title="Ver chats"><MessageCircle/><span>Chats</span></Link><NotificationBell/><Link className="button outline small" href={isOrganization?"/painel":"/interesses"}>{isOrganization?<><Building2/>Meu painel</>:<><Heart/>Meus interesses</>}</Link><form action="/api/auth/logout" method="post"><button className="headerLogout" title="Sair"><LogOut/></button></form></div>:<div className="headerActions"><Link href="/login">Entrar</Link><Link className="button orange small" href="/cadastro?role=ORGANIZATION">Cadastrar animal</Link></div>}<button className="menu" aria-label="Abrir menu"><Menu/></button></header>;
}
