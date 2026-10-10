import{Suspense}from"react";import{RegisterForm}from"@/components/register-form";import{SiteHeader}from"@/components/site-header";
export default function RegisterPage(){return <main><SiteHeader/><section className="authPage"><Suspense fallback={<div>Carregando...</div>}><RegisterForm/></Suspense></section></main>}
