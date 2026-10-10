"use client";
import { signIn } from "next-auth/react";
export function GoogleLogin(){return <><div className="authDivider"><span>ou</span></div><button type="button" className="googleButton" onClick={()=>signIn("google",{callbackUrl:"/animais"})}><b>G</b>Continuar com Google</button></>}
