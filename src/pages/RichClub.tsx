import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Award, Globe as Globe2, TrendingUp, Shield, ChevronRight } from 'lucide-react';

// Import images
import heroImage from '../assets/hero-richclub.jpg copy copy.jpeg';
import eventosImage from '../assets/eventos-richclub.jpg.png';
import espacosImage from '../assets/espacos-richapproved.jpg.jpg';
import designImage from '../assets/design-legado.jpg.jpeg';
import reconhecimentoImage from '../assets/reconhecimento-oficial.jpg.png';
import domainImage from '../assets/Fundo-Imagem-Perfil-Geral.png';
import affiliateImage from '../assets/pessoas-que-participam-de-um-evento-de-alto-protocolo.jpg';

export default function PixGlobal() {
  return (
    <div className="min-h-screen bg-black">

      {/* Hero Section - Ultra Premium */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'scaleX(-1)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/60 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8 mt-8 sm:mt-0">
              <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <span className="text-amber-400 text-xs font-semibold tracking-[0.3em] uppercase">Exclusive Community</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
              <span className="block">A Comunidade Global</span>
              <span className="block">de Identidades e</span>
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Ativos Digitais
              </span>
            </h1>

            <div className="space-y-4 mb-12">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed font-light">
                Mais do que um registro: um ecossistema mundial que conecta pessoas e empresas por meio de nomes e valores digitais.
              </p>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed font-light">
                Ao se tornar membro do Pix.Global, você entra para a primeira rede global que une identidade e valor digital de forma independente e segura.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mt-6">
                <p className="text-base sm:text-lg text-white leading-relaxed">
                  Cada membro possui um <span className="text-amber-400 font-semibold">nome</span> (ex: maria.pix.global) e um <span className="text-amber-400 font-semibold">ativo numérico</span> (ex: 9072907237839893833.pix.global) que podem ser usados para representar presença, reputação e até pagamentos diretos.
                </p>
              </div>
            </div>

            {/* Features badges - now in normal flow */}
            <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6 mb-8">
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Certificação Oficial</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Globe2 className="w-5 h-5 text-amber-400" />
                <span>Presença Global</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Exclusividade Garantida</span>
              </div>
            </div>

            <Link
              to="/valores"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:shadow-amber-400/60 hover:scale-105 group"
            >
              Explore os Planos
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Global Experiences Section */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${eventosImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Private Events</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="block">Experiências globais</span>
              <span className="block whitespace-nowrap">e encontros estratégicos</span>
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-6"></div>

            <div className="space-y-3 mb-8">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                Conecte-se com líderes, empreendedores e visionários em eventos exclusivos ao redor do mundo.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Cada encontro é cuidadosamente curado para criar valor, fortalecer relações e gerar oportunidades únicas.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-300 leading-relaxed">
                  <strong className="text-amber-400">Nota:</strong> Acesso a eventos de alto prestígio e locais exclusivos requer processo de verificação. Alguns eventos têm acesso imediato, outros podem levar de 6 meses a 2 anos para aprovação.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-amber-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm font-medium">Networking Premium</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm font-medium">Eventos Exclusivos</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm font-medium">Conexões Estratégicas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rich Approved Spaces */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${espacosImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-full px-6 py-2 mb-8">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Rich Approved</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Espaços, experiências e estabelecimentos aprovados
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-6"></div>

            <div className="space-y-3 mb-8">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                O selo <span className="text-amber-400 font-semibold">Rich Approved</span> identifica locais de excelência incomparável.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Restaurantes sofisticados, hotéis boutique, lounges exclusivos e destinos que definem o padrão de luxo e autenticidade.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Padrão de Excelência</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Cada estabelecimento passa por rigorosa avaliação de design, hospitalidade e experiência do cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design & Legacy */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${designImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 mb-8">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Heritage & Innovation</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="block">Design aprovado,</span>
              <span className="block whitespace-nowrap">legado e autenticidade</span>
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-6"></div>

            <div className="space-y-3 mb-12">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                Celebramos marcas e projetos que honram tradição enquanto abraçam inovação.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Cada item reconhecido pelo Rich Club representa o ápice da qualidade, estética refinada e narrativa autêntica.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-amber-400 mb-1">100+</div>
                <div className="text-sm text-gray-400">Marcas Aprovadas</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-amber-400 mb-1">50+</div>
                <div className="text-sm text-gray-400">Países Representados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Recognition */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${reconhecimentoImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md border border-amber-500/40 rounded-full px-6 py-2 mb-8 shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-xs font-bold tracking-widest uppercase">Official Certification</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="block sm:inline">Reconhecimento</span>
              <br className="hidden sm:block lg:block" />
              <span className="block sm:inline whitespace-nowrap">oficial como membro</span>
              <br className="hidden sm:block lg:block" />
              <span className="block sm:inline">do Rich Club</span>
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-6"></div>

            <div className="space-y-3 mb-8">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                Seu certificado digital e selo oficial não são apenas símbolos, são validações tangíveis do seu comprometimento com excelência, autenticidade e pertencimento a uma comunidade global de influência.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Membros Elite recebem também uma identidade física personalizada com QR Code dinâmico.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl shadow-amber-500/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Certificado Rich Club</h3>
                  <p className="text-amber-400 text-sm font-medium">Validação Digital Oficial</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Cada membro recebe credenciais digitais verificadas, perfil oficial na plataforma e acesso aos benefícios exclusivos da comunidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Digital Identity */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${domainImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <span className="text-amber-400 text-xs font-semibold tracking-[0.3em] uppercase">Your Domain</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="text-gray-400">yourname</span>
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">.pix.global</span>
            </h2>

            <div className="space-y-3 mb-12">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                Seu domínio personalizado .pix.global é mais que um endereço web, é uma declaração de identidade, prestígio e posicionamento no cenário digital global.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Uma URL que comunica sucesso instantaneamente.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Globe2 className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Presença Global</h3>
                <p className="text-gray-400 text-sm">Reconhecimento instantâneo em qualquer mercado</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Shield className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Proteção Total</h3>
                <p className="text-gray-400 text-sm">Infraestrutura segura e gerenciamento profissional</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Credibilidade</h3>
                <p className="text-gray-400 text-sm">Autoridade e confiança em cada interação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Program */}
      <section className="relative flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${affiliateImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-full px-6 py-2 mb-8">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Earn Commission</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Programa de Afiliados
            </h2>

            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 backdrop-blur-md border border-emerald-500/30 rounded-full px-8 py-4 mb-8 shadow-lg shadow-emerald-500/20">
              <span className="text-5xl font-bold text-emerald-400">Até 50%</span>
              <div className="text-left">
                <div className="text-white font-semibold">de Comissão</div>
                <div className="text-emerald-300 text-sm">sobre vendas confirmadas</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                Compartilhe a excelência do Rich Club com sua rede profissional.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Ao recomendar nossos serviços, você é recompensado com comissões competitivas por cada novo membro.
              </p>
            </div>

            <Link
              to="/afiliados/termos"
              className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 group"
            >
              Conheça o Programa
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-black to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-12 leading-[1.3] tracking-tight">
              <span className="block mb-2">Pronto para elevar sua</span>
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent pb-6">
                presença digital?
              </span>
            </h2>

            <div className="space-y-3 mb-12 max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                Junte-se a uma comunidade global de líderes, empreendedores e visionários.
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed font-light">
                Sua jornada no Rich Club começa agora.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/valores"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:shadow-amber-400/60 hover:scale-105 group"
              >
                Ver Planos
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/premium"
                className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 hover:border-amber-500/50 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 group"
              >
                Domínios Premium
                <Crown className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Por Que é Legal em Todo o Mundo */}
      <section className="relative bg-gradient-to-b from-zinc-950 to-black py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Por Que o Pix.Global é Legal em Todo o Mundo
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-transparent mx-auto"></div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30 rounded-3xl p-8 sm:p-12 mb-10">
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
                O Pix.Global <span className="text-white font-semibold">não é um banco</span>, <span className="text-white font-semibold">não é criptomoeda</span> e <span className="text-white font-semibold">não processa pagamentos financeiros</span>.
              </p>

              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
                É uma <span className="text-blue-400 font-semibold">plataforma de registro digital</span>, operando sob as leis internacionais que regulam ativos digitais não financeiros — como domínios, certificados e colecionáveis digitais.
              </p>

              <div className="bg-black/30 rounded-2xl p-6 mb-6">
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                  Toda compra é feita por <span className="text-white font-semibold">gateways oficiais</span> (PayPal, Stripe, Wise), de forma independente e segura.
                </p>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mt-3">
                  A Pix.Global <span className="text-amber-400 font-semibold">não guarda dinheiro</span>, <span className="text-amber-400 font-semibold">não processa transações financeiras</span> nem realiza câmbio.
                </p>
              </div>

              <p className="text-lg sm:text-xl text-white leading-relaxed font-semibold">
                Cada domínio .pix.global é um ativo digital auditado e registrado internacionalmente. Isso torna a plataforma legítima, reconhecida e legal em qualquer país do mundo.
              </p>
            </div>
          </div>

          {/* Os Ativos Numéricos */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 rounded-3xl p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
              Os Ativos Numéricos
            </h3>

            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Os ativos numéricos são <span className="text-amber-400 font-semibold">únicos, rastreáveis e escassos</span>. Cada sequência possui valor próprio, que pode aumentar conforme sua raridade ou demanda de mercado.
              </p>

              <p className="text-lg text-gray-300 leading-relaxed">
                Esses ativos funcionam como <span className="text-white font-semibold">representações legítimas de valor digital</span> — transferíveis, verificáveis e com registro de propriedade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chamada Final */}
      <section className="relative bg-black py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40 rounded-3xl p-10 sm:p-16 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Pix.Global nasceu de uma ideia simples e poderosa
            </h2>

            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              Criar o sistema que o mundo tentou e nunca conseguiu.
            </p>

            <div className="bg-black/40 rounded-2xl p-8 mb-8">
              <p className="text-lg sm:text-xl text-gray-200 leading-relaxed">
                Uma economia global baseada em <span className="text-amber-400 font-semibold">nomes</span>, <span className="text-amber-400 font-semibold">números</span> e <span className="text-amber-400 font-semibold">confiança</span> — sem bancos, sem fronteiras, sem limites.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Pix.Global — o futuro dos negócios e identidades digitais.
              </p>
              <p className="text-xl text-gray-400 font-medium">
                Sem banco. Sem criptomoeda. Com legitimidade mundial.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
