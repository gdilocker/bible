import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Globe, Award, Shield, Users, TrendingUp } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

// Import images
import heroImage from '../assets/hero-richclub.jpg.jpeg';
import eventosImage from '../assets/eventos-richclub.jpg.png';
import espacosImage from '../assets/espacos-richapproved.jpg.jpg';
import designImage from '../assets/design-legado.jpg.jpeg';
import reconhecimentoImage from '../assets/reconhecimento-oficial.jpg.png';

export default function RichClub() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero Section - Full Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/80"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-6 py-2 mb-8 backdrop-blur-sm">
            <Crown className="w-5 h-5 text-amber-300" />
            <span className="text-amber-100 font-medium text-sm tracking-widest">RICH CLUB</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            WELCOME TO<br />THE RICH CLUB
          </h1>

          <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-8"></div>

          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Tenha uma identidade que vai além do digital.<br />
            Use-a para gerar conexões, transformar oportunidades e alcançar resultados reais.
          </p>
        </div>
      </section>

      {/* Experiências Globais - Full Background */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${eventosImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="h-1 w-16 bg-blue-400 mb-6"></div>

            <p className="text-blue-300 font-medium text-sm tracking-widest mb-4 uppercase">Private Events</p>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              GLOBAL EXPERIENCES<br />
              AND STRATEGIC GATHERINGS
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              O Rich Club conecta pessoas e marcas em eventos privados e seleções exclusivas em todo o mundo.
              Cada encontro é uma oportunidade de fortalecer relações e criar conexões com propósito.
            </p>
          </div>
        </div>
      </section>

      {/* Espaços Rich Approved - Full Background */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${espacosImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/95 via-slate-900/80 to-slate-900/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl ml-auto text-right">
            <div className="h-1 w-16 bg-amber-400 mb-6 ml-auto"></div>

            <p className="text-amber-300 font-medium text-sm tracking-widest mb-4 uppercase">Recognized Destinations</p>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              SPACES, EXPERIENCES, AND<br />
              ESTABLISHMENTS APPROVED
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              Os locais que levam o selo <strong className="text-amber-300">Rich Approved</strong> são cuidadosamente escolhidos pelo seu padrão de excelência, design e hospitalidade.
              Representam o melhor em luxo, conforto e autenticidade.
            </p>
          </div>
        </div>
      </section>

      {/* Design e Legado - Full Background */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${designImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <div className="h-1 w-16 bg-blue-400 mb-6"></div>

            <p className="text-blue-300 font-medium text-sm tracking-widest mb-4 uppercase">Heritage & Innovation</p>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              APPROVED DESIGN,<br />
              LEGACY AND AUTHENTICITY
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              O Rich Club valoriza marcas, produtos e projetos que unem herança e inovação.
              Cada item aprovado reflete qualidade, estética e história — reconhecidos oficialmente como parte do estilo de vida Rich.
            </p>
          </div>
        </div>
      </section>

      {/* Reconhecimento Oficial - Full Background */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${reconhecimentoImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900/95 via-slate-900/85 to-slate-900/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl ml-auto text-right">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-5 py-2 mb-6 backdrop-blur-sm">
              <Crown className="w-5 h-5 text-amber-300" />
              <span className="text-amber-100 font-medium text-sm">CERTIFICAÇÃO OFICIAL</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              OFFICIAL RECOGNITION<br />
              AS A RICH CLUB MEMBER
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              Ao se tornar membro, você recebe o certificado digital e o selo oficial do Rich Club.
              Essa validação representa credibilidade e pertencimento a uma comunidade global de prestígio.
            </p>
          </div>
        </div>
      </section>

      {/* Sua Identidade Digital */}
      <section className="relative py-32 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-5 py-2 mb-6">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 font-medium text-sm tracking-widest">IDENTIDADE EXCLUSIVA</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            yourname.com.rich
          </h2>

          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-8"></div>

          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Com seu domínio <strong className="text-amber-300">.com.rich</strong>, você ganha uma presença digital personalizada e reconhecida.
            Sua página oficial une identidade, propósito e posicionamento em um único endereço exclusivo.
          </p>
        </div>
      </section>

      {/* Tudo em um só lugar */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-2 mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 font-medium text-sm tracking-widest">PLATAFORMA INTEGRADA</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Tudo o que importa<br />em um só lugar
          </h2>

          <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-8"></div>

          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            O Rich Club integra domínio, página oficial, rede social e autenticação de membro em uma única experiência.
            Uma plataforma que une reconhecimento, visibilidade e resultados.
          </p>
        </div>
      </section>

      {/* Programa de Afiliados */}
      <section className="relative py-32 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-5 py-2 mb-6">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-200 font-medium text-sm tracking-widest">GANHE COMISSÕES</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4 leading-tight">
            Programa de Afiliados
          </h2>

          <p className="text-2xl text-emerald-300 font-semibold mb-8">
            Ganhe até 50% de comissão sobre vendas confirmadas
          </p>

          <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-8"></div>

          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-4">
            Os membros do Rich Club que indicam novos associados recebem comissões diretas conforme as regras do programa de afiliação.
            Uma forma de transformar influência e conexões em retorno real.
          </p>

          <p className="text-sm text-gray-400">
            Consulte <Link to="/valores" className="text-amber-300 hover:text-amber-200 underline transition-colors">planos</Link> e <Link to="/afiliados/termos" className="text-amber-300 hover:text-amber-200 underline transition-colors">condições</Link>.
          </p>
        </div>
      </section>

      {/* Transforme sua Presença */}
      <section className="relative py-32 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-5 py-2 mb-6">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 font-medium text-sm tracking-widest">RESULTADOS REAIS</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Transforme sua presença digital<br />em resultados reais
          </h2>

          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-8"></div>

          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            O Rich Club cria a ponte entre reputação e reconhecimento.
            Seu domínio .com.rich e sua identidade validada se tornam o ponto de partida para conexões, negócios e oportunidades globais.
          </p>
        </div>
      </section>

      {/* Aviso Legal */}
      <section className="relative py-20 bg-slate-950/90 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Aviso Legal
          </h3>

          <p className="text-sm text-gray-400 leading-relaxed text-center">
            O Rich Club é uma página institucional operada pela <strong className="text-gray-300">Global Digital Identity LTD</strong>, parte integrante do site oficial <strong className="text-amber-300">com.rich</strong>.
            Seu objetivo é apresentar o conceito e os valores do Rich Club, além de informar sobre o funcionamento e o propósito do ecossistema .com.rich.
            As marcas, logotipos e elementos visuais relacionados são de uso exclusivo da entidade.
            O uso da licença .com.rich implica aceitação dos Termos de Uso e Políticas de Privacidade disponíveis em <Link to="/termos" className="text-amber-300 hover:text-amber-200 underline transition-colors">com.rich/termos</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
