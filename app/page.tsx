import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Dog, Heart, MapPin, Menu, PawPrint, Search, ShieldCheck, Star, Users } from "lucide-react";

const animals = [
  { name: "Thor", type: "SRD", sex: "Macho", age: "2 anos", city: "São Paulo - SP", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=85" },
  { name: "Mel", type: "SRD", sex: "Fêmea", age: "1 ano", city: "Curitiba - PR", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=700&q=85" },
  { name: "Bob", type: "SRD", sex: "Macho", age: "3 anos", city: "Belo Horizonte - MG", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=85" },
  { name: "Luna", type: "SRD", sex: "Fêmea", age: "2 anos", city: "Recife - PE", image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=700&q=85" },
];

function Logo() {
  return <Link className="logo" href="/"><PawPrint aria-hidden="true" /><span>Adota</span><strong>Pet</strong></Link>;
}

export default function Home() {
  return (
    <main>
      <header className="header container">
        <Logo />
        <nav aria-label="Navegação principal">
          <Link className="active" href="/">Início</Link><Link href="/animais">Animais</Link><Link href="#como-adotar">Como adotar</Link><Link href="#ongs">ONGs/Protetores</Link>
        </nav>
        <div className="headerActions"><Link href="/login">Entrar</Link><Link className="button orange small" href="/painel/animais/novo">Cadastrar animal</Link></div>
        <button className="menu" aria-label="Abrir menu"><Menu /></button>
      </header>

      <section className="hero">
        <div className="container heroGrid">
          <div className="heroCopy">
            <span className="eyebrow"><Heart size={16} fill="currentColor" /> Mais amor no mundo</span>
            <h1>Encontre um novo <em>melhor amigo</em></h1>
            <p>Conectamos cães e gatos que precisam de um lar com pessoas que acreditam na adoção responsável. Mais do que pets, são novas histórias para toda a vida.</p>
            <div className="ctaRow"><Link className="button green" href="/animais"><Search size={20}/> Quero adotar <ArrowRight size={18}/></Link><Link className="button outline" href="/cadastro"><Users size={20}/> Sou ONG/Protetor</Link></div>
            <div className="trust"><span><Heart size={15}/> Adoção responsável</span><span><Users size={15}/> ONGs verificadas</span><span><PawPrint size={15}/> Centenas de animais</span></div>
          </div>
          <div className="heroVisual">
            <div className="blob"></div>
            <Image className="heroImage" src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=90" alt="Cão e gato aguardando adoção" width={760} height={640} priority />
            <span className="scribble">Adotar é transformar vidas ♡</span>
          </div>
        </div>
      </section>

      <section className="container searchBar" aria-label="Busca de animais">
        <label><PawPrint/><span><b>Espécie</b><select aria-label="Espécie"><option>Todos</option><option>Cães</option><option>Gatos</option></select></span></label>
        <label><MapPin/><span><b>Cidade</b><input placeholder="Digite sua cidade" /></span></label>
        <label><Dog/><span><b>Porte</b><select aria-label="Porte"><option>Todos</option><option>Pequeno</option><option>Médio</option><option>Grande</option></select></span></label>
        <Link className="button green" href="/animais"><Search size={19}/> Buscar</Link>
      </section>

      <section className="container section">
        <div className="sectionHead"><div><h2>Animais para adoção</h2><p>Conheça alguns dos nossos amigos que estão esperando por um lar.</p></div><Link href="/animais">Ver todos os animais <ArrowRight size={17}/></Link></div>
        <div className="petGrid">{animals.map((animal) => <article className="petCard" key={animal.name}><div className="petImage"><Image src={animal.image} alt={`${animal.name}, disponível para adoção`} fill sizes="(max-width: 700px) 90vw, 25vw"/><button aria-label={`Favoritar ${animal.name}`}><Heart/></button></div><div className="petInfo"><h3>{animal.name}</h3><div className="meta"><span><PawPrint/> {animal.type}</span><span>{animal.sex}</span><span><CalendarDays/> {animal.age}</span><span><MapPin/> {animal.city}</span></div><Link href={`/animais/${animal.name.toLowerCase()}`}>Ver perfil</Link></div></article>)}</div>
      </section>

      <section className="container section" id="como-adotar">
        <div className="sectionHead"><div><h2>Como funciona</h2><p>Adotar é simples, seguro e transforma vidas.</p></div></div>
        <div className="steps"><article><span>1</span><div className="stepIcon orangeBg"><Dog/></div><div><h3>Escolha um animal</h3><p>Navegue pelos perfis e encontre um pet que combine com você.</p></div></article><article><span>2</span><div className="stepIcon greenBg"><ArrowRight/></div><div><h3>Envie seu interesse</h3><p>Preencha um breve formulário para falar com a ONG ou protetor.</p></div></article><article><span>3</span><div className="stepIcon orangeBg"><CalendarDays/></div><div><h3>Agende uma visita</h3><p>Converse com o responsável, conheça o animal e dê seu lar a ele.</p></div></article></div>
      </section>

      <section className="safety"><div className="container section"><div className="sectionHead"><div><h2>Por uma adoção mais segura e consciente</h2><p>Uma experiência confiável, transparente e positiva para todos.</p></div></div><div className="benefits"><article><ShieldCheck/><div><h3>Adoção responsável</h3><p>Decisões conscientes e informadas, pensando no bem-estar animal.</p></div></article><article><Users/><div><h3>ONGs verificadas</h3><p>Organizações e protetores reais durante todo o processo.</p></div></article><article><Star/><div><h3>Processo acessível</h3><p>Uma plataforma simples para facilitar encontros que mudam vidas.</p></div></article></div></div></section>

      <section className="container ngo section" id="ongs"><div><h2>Para ONGs e protetores</h2><p>Cadastre seus animais, gerencie solicitações, aprove visitas e marque como adotado, tudo em um só lugar.</p><ul><li><CheckCircle2/> Cadastro de animais com fotos e informações</li><li><CheckCircle2/> Gerenciamento de solicitações de interesse</li><li><CheckCircle2/> Aprovação de visitas e acompanhamento</li><li><CheckCircle2/> Histórico completo das adoções</li></ul><Link className="button orange" href="/cadastro">Cadastrar meus animais <ArrowRight/></Link></div><div className="dashboardMock"><div className="mockTop"><Logo/><span>ONG Patas Felizes</span></div><div className="mockBody"><aside>Meu painel<br/>Meus animais<br/>Solicitações<br/>Visitas<br/>Adotados</aside><div><h3>Meu painel</h3><p>Acompanhe seus animais e solicitações</p><div className="stats"><b>12<small>Animais</small></b><b>8<small>Solicitações</small></b><b>4<small>Visitas</small></b></div></div></div></div></section>

      <footer><div className="container footerGrid"><div><Logo/><p>Mais que adoção. Novas histórias.<br/>Conectando pessoas e animais.</p></div><div><b>Links rápidos</b><Link href="/animais">Animais</Link><Link href="#como-adotar">Como adotar</Link></div><div><b>Institucional</b><Link href="#">Sobre nós</Link><Link href="#">Dúvidas frequentes</Link></div><div><b>Entre em contato</b><span>contato@adotapet.com.br</span><span>Joinville - SC</span></div></div><p className="copyright">© 2026 AdotaPet. Um mundo melhor também é feito de adoção.</p></footer>
    </main>
  );
}
