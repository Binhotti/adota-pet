import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return false;
      const existing = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
      if (existing?.suspendedAt) return false;
      if (existing) await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: new Date(), image: user.image } });
      return true;
    },
    async session({ session, user }) {
      if (session.user) Object.assign(session.user, { id: user.id, role: user.role });
      return session;
    }
  }
});
