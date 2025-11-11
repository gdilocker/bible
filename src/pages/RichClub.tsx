import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, Award, Globe as Globe2, TrendingUp, Shield, ChevronRight, CheckCircle } from 'lucide-react';

import heroImage from '../assets/pessoas-que-participam-de-um-evento-de-alto-protocolo.jpg';

export default function PixGlobal() {
  return (
    <div className="min-h-screen bg-black">

      {/* Hero Section - O NOVO PADRÃO MUNDIAL */}
      <section className="relative flex items-center overflow-hidden min-h-screen">
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/70 to-black/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-amber-400 to-transparent"></div>
              <span className="text-amber-400 text-xs font-bold tracking-[0.4em] uppercase">SOBRE — O NOVO PADRÃO MUNDIAL</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-10 leading-[0.95] tracking-tight">
              <span className="block mb-3">O sistema que</span>
              <span className="block mb-3">ninguém conseguiu</span>
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                criar. Até agora.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 leading-relaxed font-light mb-16 max-w-3xl">
              Pix.Global une identidade, comunicação e valor digital — sem banco, sem cripto, sem fronteiras. É simples, legal e mundial.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/registrar"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:shadow-amber-400/60 hover:scale-105 group"
              >
                Registrar Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/valores"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 group"
              >
                Explorar Planos
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE É O PIX.GLOBAL */}
      <section className="relative bg-gradient-to-b from-black to-zinc-950 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              O QUE É O PIX.GLOBAL
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-amber-400 to-transparent mx-auto mb-8"></div>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed text-center mb-12">
              Pix.Global é a primeira plataforma mundial que une nomes, e-mails e números digitais em um só ecossistema — criando a base de uma nova economia global legítima, onde identidade e valor coexistem de forma rastreável, auditável e independente.
            </p>

            {/* Seu nome global */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 rounded-2xl p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Seu nome global: <span className="text-amber-400">seunome.pix.global</span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                sua presença oficial e pública no mundo digital.
              </p>
              <div className="bg-black/40 rounded-xl p-4">
                <p className="text-base text-gray-400">
                  Redireciona automaticamente para:<br/>
                  <span className="text-white font-mono">https://seunome.pix.global</span> → <span className="text-amber-400 font-mono">https://pix.global/seunome</span>
                  <br/>— sua página personalizada de links, contatos e recebimentos.
                </p>
              </div>
            </div>

            {/* Seu e-mail global */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30 rounded-2xl p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Seu e-mail global <span className="text-gray-500">(opcional)</span>: <span className="text-blue-400">seunome@pix.global</span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                sua chave de recebimento e comunicação global, ativável sob demanda.
              </p>
              <p className="text-base text-gray-400">
                Compatível com plataformas internacionais como PayPal, Stripe e Wise.
              </p>
            </div>

            {/* Seus números digitais */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-2 border-emerald-500/30 rounded-2xl p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Seus números digitais <span className="text-gray-500">(créditos)</span>: <span className="text-emerald-400 font-mono">9072907237839893833.pix.global</span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                suas unidades de valor digital legítimo, exclusivas e transferíveis.
              </p>
            </div>

            <div className="text-center pt-8">
              <p className="text-2xl sm:text-3xl font-bold text-white">
                Três camadas. Uma identidade global. Tudo conectado e auditável.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUE É TÃO DISRUPTIVO */}
      <section className="relative bg-zinc-950 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              POR QUE É TÃO DISRUPTIVO
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-red-400 to-transparent mx-auto"></div>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed text-center mb-12">
              Durante décadas, governos e bancos tentaram criar um sistema verdadeiramente global de valor.<br/>
              <span className="text-white font-semibold">Prometeram. Complexificaram. Não entregaram.</span>
            </p>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/30 rounded-2xl p-10">
              <p className="text-2xl font-bold text-white mb-8 text-center">
                Pix.Global entrega porque é diferente na essência:
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl text-white font-semibold mb-1">Não é banco</p>
                    <p className="text-gray-400">não guarda dinheiro, não faz câmbio.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl text-white font-semibold mb-1">Não é criptomoeda</p>
                    <p className="text-gray-400">não depende de blockchain pública nem de volatilidade.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl text-white font-semibold mb-1">É registro digital legítimo</p>
                    <p className="text-gray-400">nomes, e-mails e números com propriedade, escassez e histórico verificável.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-red-500/30">
                <p className="text-xl text-center text-amber-400 font-semibold">
                  Simples de usar. Legal em qualquer país. Pronto para o dia a dia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (3 PASSOS) */}
      <section className="relative bg-gradient-to-b from-zinc-950 to-black py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              COMO FUNCIONA (3 PASSOS)
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-transparent mx-auto"></div>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-black">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Registre sua identidade</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Escolha seu domínio — por exemplo, <span className="text-blue-400 font-semibold">maria.pix.global</span>.
                Ele é seu endereço global exclusivo.
              </p>
              <div className="bg-black/40 rounded-lg p-3 text-sm text-gray-400">
                Redirecionamento automático:<br/>
                <span className="text-white font-mono">maria.pix.global</span> → <span className="text-blue-400 font-mono">pix.global/maria</span>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-2 border-emerald-500/30 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-black">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Receba seus créditos digitais</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Ao registrar, você recebe seus primeiros números .pix.global (ex.: <span className="text-emerald-400 font-mono">9072…pix.global</span>).
              </p>
              <p className="text-gray-400 text-sm">
                Esses números são suas unidades de valor digital legítimo — exclusivas, auditáveis e transferíveis.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-black">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Use, some, transfira</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Use seus números para enviar, receber ou representar valor digital.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Some vários números para compor valores maiores.
              </p>
              <p className="text-gray-400 text-sm">
                Compre novos números a qualquer momento — tudo simples, legal e registrado.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-2xl font-bold text-white mb-3">
                "Você aceita Pix.Global?"
              </p>
              <p className="text-xl text-gray-300">
                Responda com o que preferir: seu nome, seu e-mail (opcional) ou seu número.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEU NÚMERO DIGITAL */}
      <section className="relative bg-black py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              SEU NÚMERO DIGITAL<br/>
              <span className="text-emerald-400 font-mono text-3xl sm:text-4xl">9072907237839893833.pix.global</span>
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-emerald-400 to-transparent mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              É sua unidade de valor digital registrada.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-2 border-emerald-500/30 rounded-2xl p-10">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Cada número é único e pode ser transferido, somado, trocado ou mantido como reserva de valor dentro do ecossistema.
              </p>

              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Ao registrar seu nome global, você recebe créditos iniciais e pode adquirir novos ativos numéricos a qualquer momento para:
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">complementar pagamentos,</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">ampliar seu portfólio,</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">negociar números raros (sequências, capicuas, simbólicos).</span>
                </li>
              </ul>

              <p className="text-xl text-white font-semibold text-center">
                Tudo com registro, histórico e verificação global.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LEGALIDADE GLOBAL */}
      <section className="relative bg-gradient-to-b from-black to-zinc-950 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              LEGALIDADE GLOBAL — CLARO E DIRETO
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-transparent mx-auto"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/30 rounded-2xl p-10 space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                Pix.Global <span className="text-white font-semibold">não é banco</span>, <span className="text-white font-semibold">não processa transações financeiras</span> entre usuários e <span className="text-white font-semibold">não realiza câmbio</span>.
              </p>

              <p className="text-lg text-gray-300 leading-relaxed">
                Atua como <span className="text-blue-400 font-semibold">plataforma de registro digital</span> sob normas de ativos não financeiros (como domínios e certificados).
              </p>

              <p className="text-lg text-gray-300 leading-relaxed">
                Todas as compras são processadas por <span className="text-white font-semibold">gateways oficiais</span> (PayPal, Stripe, Wise).
              </p>

              <p className="text-lg text-gray-300 leading-relaxed">
                Cada domínio e número .pix.global possui <span className="text-blue-400 font-semibold">propriedade e auditoria internacionalmente reconhecidas</span>.
              </p>

              <div className="pt-6 border-t border-blue-500/30">
                <p className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Legal, simples e mundial — do jeito que a internet deveria ser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXCLUSIVIDADE E ESCASSEZ */}
      <section className="relative bg-zinc-950 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              EXCLUSIVIDADE E ESCASSEZ
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-amber-400 to-transparent mx-auto"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 rounded-2xl p-10 space-y-8">
              <div className="text-center">
                <p className="text-2xl text-white font-bold mb-4">
                  Nomes e números são únicos e irrepetíveis.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Quanto mais curto, raro ou simbólico, maior o valor<br/>
                  (ex.: <span className="text-amber-400 font-mono">1.pix.global</span>, <span className="text-amber-400 font-mono">777.pix.global</span>, <span className="text-amber-400 font-mono">2025.pix.global</span>).
                </p>
                <p className="text-xl text-gray-300">
                  Uma vez registrado, ninguém mais poderá tê-lo.
                </p>
              </div>

              <div className="bg-black/40 rounded-xl p-8 text-center">
                <p className="text-3xl font-bold text-amber-400 mb-3">
                  Chegar cedo importa.
                </p>
                <p className="text-xl text-gray-300">
                  Os nomes e números mais valiosos estão sendo registrados agora.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="relative bg-gradient-to-b from-zinc-950 to-black py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              MANIFESTO
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-amber-400 to-transparent mx-auto"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-2 border-amber-500/40 rounded-3xl p-12 text-center">
              <div className="mb-8">
                <Sparkles className="w-16 h-16 text-amber-400 mx-auto" />
              </div>

              <p className="text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-relaxed mb-8">
                Criamos o que o mundo tentou e não conseguiu:<br/>
                uma ponte universal entre identidade e valor, simples o suficiente para qualquer pessoa usar,<br/>
                sólida o bastante para operar em qualquer país e legítima para durar décadas.
              </p>

              <div className="space-y-4 mb-10">
                <p className="text-xl sm:text-2xl text-amber-400 font-semibold">
                  Sem bancos. Sem cripto. Sem fronteiras.
                </p>
                <p className="text-lg sm:text-xl text-gray-300">
                  Apenas você, sua identidade e seus números — vivos, legítimos e reconhecidos globalmente.
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-8 mb-8">
                <p className="text-xl sm:text-2xl text-white leading-relaxed">
                  O Pix.Global é a inovação mais disruptiva do mundo na convergência entre presença digital, recebimento global e propriedade verificável.
                </p>
              </div>

              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                É o início de uma nova era: a Era da Identidade Global Viva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative bg-black py-20 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/valores"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-amber-500/50 hover:shadow-amber-400/60 hover:scale-105 group"
              >
                Explorar Planos
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/registrar"
                className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 group"
              >
                Registrar Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white px-10 py-5 rounded-full font-semibold text-lg transition-all duration-300 group"
              >
                Como Usar
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
