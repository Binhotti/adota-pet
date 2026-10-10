# AdotaPet

Plataforma de adoção responsável para conectar adotantes, ONGs, abrigos e protetores independentes.

## Tecnologias

- Next.js 15 + TypeScript
- PostgreSQL (recomendado: Neon)
- Prisma ORM
- Auth.js (será configurado junto das telas de autenticação)
- Vercel para deploy

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

Abra `http://localhost:3000`.

## Banco de dados

1. Crie um banco PostgreSQL na Neon.
2. Copie a connection string para `DATABASE_URL` em `.env.local`.
3. Execute `npm run db:push`.

## GitHub e Vercel

1. Crie um repositório no GitHub e envie esta pasta.
2. Importe o repositório na Vercel.
3. Cadastre `DATABASE_URL` e `AUTH_SECRET` em **Settings → Environment Variables**.
4. Faça o deploy. O comando de build já gera o Prisma Client automaticamente.

## Próximas etapas do MVP

- Listagem e filtros reais de animais
- Página de detalhes
- Login e cadastro por perfil
- Painel de ONG/protetor e CRUD de animais
- Solicitações, análise e contato
- Agendamento/aprovação de visitas
- Atualização do status da adoção
- Localização aproximada do animal
