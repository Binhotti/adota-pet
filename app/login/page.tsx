import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
export default function LoginPage(){return <main><SiteHeader/><section className="authPage"><Suspense fallback={<div>Carregando...</div>}><AuthForm/></Suspense></section></main>}
