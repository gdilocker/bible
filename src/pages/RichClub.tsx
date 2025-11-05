import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Award, Globe2, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

// Import images
import heroImage from '../assets/hero-richclub.jpg copy copy.jpeg';
import eventosImage from '../assets/eventos-richclub.jpg.png';
import espacosImage from '../assets/espacos-richapproved.jpg.jpg';
import designImage from '../assets/design-legado.jpg.jpeg';
import reconhecimentoImage from '../assets/reconhecimento-oficial.jpg.png';
import domainImage from '../assets/1234567 copy.png';
import affiliateImage from '../assets/Imagens do site (16)-min (1) (1) (1)_batcheditor_fotor copy.jpg';

export default function RichClub() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section - Ultra Premium */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <span className="text-amber-400 text-xs font-semibold tracking-[0.3em] uppercase">Exclusive Community</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[0.95] tracking-tight">
              Welcome to the<br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Rich Club
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-12 font-light">
              Uma identidade digital que transcende o virtual.<br />
              Conexões autênticas. Oportunidades globais. Resultados extraordinários.
            </p>

            <Link
              to="/valores"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:shadow-amber-400/60 hover:scale-105 group"
            >
              Explore os Planos
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-8 left-8 right-8 z-10 hidden lg:flex justify-between items-center">
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Certificação Oficial</span>
          </div>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <Globe2 className="w-5 h-5 text-amber-400" />
            <span>Presença Global</span>
          </div>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>Exclusividade Garantida</span>
          </div>
        </div>
      </section>

      {/* Global Experiences Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Private Events</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Experiências globais e encontros estratégicos
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-8"></div>

            <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
              Conecte-se com líderes, empreendedores e visionários em eventos exclusivos ao redor do mundo.
              Cada encontro é cuidadosamente curado para criar valor, fortalecer relações e gerar oportunidades únicas.
            </p>

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
      <section className="relative min-h-screen flex items-center overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-full px-6 py-2 mb-8">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Rich Approved</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Espaços, experiências e estabelecimentos aprovados
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-8"></div>

            <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
              O selo <span className="text-amber-400 font-semibold">Rich Approved</span> identifica locais de excelência incomparável.
              Restaurantes sofisticados, hotéis boutique, lounges exclusivos e destinos que definem o padrão de luxo e autenticidade.
            </p>

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
      <section className="relative min-h-screen flex items-center overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 mb-8">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Heritage & Innovation</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Design aprovado, legado e autenticidade
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-8"></div>

            <p className="text-xl text-gray-300 leading-relaxed mb-12 font-light">
              Celebramos marcas e projetos que honram tradição enquanto abraçam inovação.
              Cada item reconhecido pelo Rich Club representa o ápice da qualidade, estética refinada e narrativa autêntica.
            </p>

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
      <section className="relative min-h-screen flex items-center overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md border border-amber-500/40 rounded-full px-6 py-2 mb-8 shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-xs font-bold tracking-widest uppercase">Official Certification</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Reconhecimento oficial como membro do Rich Club
            </h2>

            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-transparent mb-8"></div>

            <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
              Seu certificado digital e selo oficial não são apenas símbolos — são validações tangíveis do seu comprometimento com excelência,
              autenticidade e pertencimento a uma comunidade global de influência.
            </p>

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
                Cada membro recebe credenciais digitais verificadas, perfil oficial na plataforma e acesso vitalício aos benefícios exclusivos da comunidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Digital Identity */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <span className="text-amber-400 text-xs font-semibold tracking-[0.3em] uppercase">Your Domain</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              <span className="text-gray-400">yourname</span>
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">.com.rich</span>
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed mb-12 font-light">
              Seu domínio personalizado .com.rich é mais que um endereço web — é uma declaração de identidade,
              prestígio e posicionamento no cenário digital global. Uma URL que comunica sucesso instantaneamente.
            </p>

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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${affiliateImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-full px-6 py-2 mb-8">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Earn Commission</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Programa de Afiliados
            </h2>

            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 backdrop-blur-md border border-emerald-500/30 rounded-full px-8 py-4 mb-8 shadow-lg shadow-emerald-500/20">
              <span className="text-5xl font-bold text-emerald-400">50%</span>
              <div className="text-left">
                <div className="text-white font-semibold">de Comissão</div>
                <div className="text-emerald-300 text-sm">sobre vendas confirmadas</div>
              </div>
            </div>

            <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
              Transforme sua rede de contatos em uma fonte de receita sustentável.
              Membros do Rich Club que indicam novos associados recebem comissões generosas e recorrentes.
            </p>

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
      <section className="relative py-32 bg-gradient-to-b from-black to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Pronto para elevar sua<br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                presença digital?
              </span>
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed mb-12 font-light max-w-2xl mx-auto">
              Junte-se a uma comunidade global de líderes, empreendedores e visionários.
              Sua jornada no Rich Club começa agora.
            </p>

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

      {/* Legal Notice */}
      <section className="relative py-16 bg-black/50 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 leading-relaxed text-center">
            O Rich Club é uma página institucional operada pela <strong className="text-gray-400">Global Digital Identity LTD</strong>, parte integrante do ecossistema <strong className="text-amber-400">com.rich</strong>.
            Ao utilizar nossos serviços, você concorda com os <Link to="/termos" className="text-amber-400 hover:text-amber-300 underline transition-colors">Termos de Uso</Link> e <Link to="/politica" className="text-amber-400 hover:text-amber-300 underline transition-colors">Políticas de Privacidade</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
