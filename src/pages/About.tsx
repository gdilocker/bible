import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Shield, Zap, Check, ArrowRight, Sparkles, Lock, TrendingUp, Users, DollarSign, Hash } from 'lucide-react';

const About = () => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-amber-950/20" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="inline-block px-6 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-semibold text-sm mb-6">
              O NOVO PADRÃO MUNDIAL
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent leading-tight">
              O sistema que ninguém conseguiu criar. Até agora.
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Pix.Global une <span className="text-amber-400 font-semibold">identidade</span>, <span className="text-amber-400 font-semibold">comunicação</span> e <span className="text-amber-400 font-semibold">valor digital</span> — sem banco, sem cripto, sem fronteiras. É simples, legal e mundial.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/register"
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Registrar Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Ver Planos
            </Link>
          </motion.div>
        </div>
      </section>

      {/* O Que É Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              O QUE É O PIX.GLOBAL
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Pix.Global é a primeira infraestrutura global que transforma seu nome, seu contato e seus números em uma <span className="text-amber-400 font-semibold">identidade viva</span> com valor digital legítimo.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Seu Nome Global */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/40 transition-all duration-300"
            >
              <Globe className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-amber-400">Seu nome global</h3>
              <p className="text-gray-300 mb-4">
                <code className="text-amber-400 font-mono">seunome.pix.global</code> — sua presença oficial e pública.
              </p>
              <p className="text-sm text-gray-400">
                Redireciona automaticamente para:<br/>
                <code className="text-amber-400/70 text-xs">https://seunome.pix.global</code> → <code className="text-amber-400/70 text-xs">https://pix.global/seunome</code>
              </p>
            </motion.div>

            {/* Seu E-mail Global */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300"
            >
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-blue-400">Seu e-mail global <span className="text-sm text-gray-400">(opcional)</span></h3>
              <p className="text-gray-300 mb-4">
                <code className="text-blue-400 font-mono">seunome@pix.global</code> — sua chave de recebimento e comunicação.
              </p>
              <p className="text-sm text-gray-400">
                Compatível com plataformas que aceitam e-mail para pagamento (ex.: PayPal, Stripe, Wise).
              </p>
            </motion.div>

            {/* Seus Números Digitais */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all duration-300"
            >
              <Hash className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-green-400">Seus números digitais</h3>
              <p className="text-gray-300 mb-4">
                <code className="text-green-400 font-mono text-xs">9072907237839893833.pix.global</code>
              </p>
              <p className="text-sm text-gray-400">
                Unidades de valor digital registradas, exclusivas e transferíveis.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-xl text-amber-400 font-semibold">
              Três camadas. Uma identidade global. Tudo conectado e auditável.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Por Que É Disruptivo */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-amber-500 bg-clip-text text-transparent">
              POR QUE É TÃO DISRUPTIVO
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-4">
              Durante décadas, governos e bancos tentaram criar um sistema verdadeiramente global de valor.
            </p>
            <p className="text-2xl text-gray-200 font-semibold">
              Prometeram. Complexificaram. <span className="text-red-400">Não entregaram.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-10 mb-8"
          >
            <p className="text-2xl text-white font-semibold mb-8 text-center">
              Pix.Global entrega porque é diferente na essência:
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Não é banco</h3>
                <p className="text-gray-400">
                  Não custodia dinheiro, não faz câmbio.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Não é criptomoeda</h3>
                <p className="text-gray-400">
                  Não depende de volatilidade, nem de exchanges.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-green-400">É registro digital legítimo</h3>
                <p className="text-gray-400">
                  Nomes, e-mails e números com propriedade e histórico.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-2xl text-amber-400 font-semibold">
              Simples de usar. Legal em escala mundial. Pronto para o dia a dia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              COMO FUNCIONA (3 PASSOS)
            </h2>
          </motion.div>

          <div className="space-y-8">
            {/* Passo 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 rounded-xl p-8"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-amber-400">Registre sua identidade</h3>
                  <p className="text-gray-300 mb-2">
                    Escolha seu domínio: <code className="text-amber-400 font-mono">maria.pix.global</code>. Ele é seu endereço global.
                  </p>
                  <p className="text-sm text-gray-400">
                    Redirecionamento automático: <code className="text-amber-400/70">maria.pix.global</code> → <code className="text-amber-400/70">pix.global/maria</code>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Passo 2 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 rounded-xl p-8"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-green-400">Receba seus créditos digitais</h3>
                  <p className="text-gray-300 mb-2">
                    Ao registrar, você recebe seus primeiros números .pix.global (ex.: <code className="text-green-400 font-mono">9072…pix.global</code>).
                  </p>
                  <p className="text-sm text-gray-400">
                    Esses números são suas unidades de valor digital — exclusivas, auditáveis e transferíveis.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Passo 3 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 rounded-xl p-8"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-blue-400">Use, some, transfira</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Pague ou receba transferindo números entre contas Pix.Global.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Some vários números para compor valores maiores.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Compre novos números quando precisar complementar — tudo simples e registrado.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 rounded-2xl p-8">
              <p className="text-2xl font-bold text-white mb-2">
                "Você aceita Pix.Global?"
              </p>
              <p className="text-lg text-gray-300">
                Responda com o que preferir: seu nome, seu e-mail (opcional) ou seu número.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seu Número Digital */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-green-950/10 to-transparent border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              SEU NÚMERO DIGITAL (O ATIVO DE VALOR)
            </h2>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 mb-8">
              <code className="text-2xl sm:text-3xl font-mono text-green-400 break-all">
                9072907237839893833.pix.global
              </code>
              <p className="text-gray-300 mt-4 text-lg">
                É sua unidade de valor digital registrada.
              </p>
            </div>

            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Cada número é único e pode ser transferido, somado, trocado ou mantido como reserva de valor dentro do ecossistema.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
              <p className="text-lg text-gray-300 mb-6">
                Ao registrar seu nome, você recebe créditos iniciais e pode comprar novos números a qualquer momento para:
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white mb-1">Complementar pagamentos</p>
                    <p className="text-sm text-gray-400">Use múltiplos números para formar valores</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white mb-1">Ampliar seu portfólio</p>
                    <p className="text-sm text-gray-400">Acumule números como ativos digitais</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white mb-1">Negociar ativos escassos</p>
                    <p className="text-sm text-gray-400">Raros, repetidos, capicuas, sequenciais</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-amber-400 font-semibold mt-8 text-lg">
                Tudo com registro, histórico e verificação.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Legalidade Global */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              LEGALIDADE GLOBAL (CLARO E DIRETO)
            </h2>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-10 text-left">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-300">
                    Pix.Global <span className="text-white font-semibold">não é banco</span>, não processa transações financeiras entre usuários e não realiza câmbio.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Check className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-300">
                    Atuamos como <span className="text-white font-semibold">plataforma de registro digital</span> sob normas de ativos digitais não financeiros (como domínios e certificados).
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <DollarSign className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-300">
                    Compras de registros e planos são processadas por <span className="text-white font-semibold">gateways oficiais</span> (PayPal, Stripe, Wise).
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Globe className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-300">
                    Cada domínio .pix.global e cada número .pix.global possui <span className="text-white font-semibold">propriedade e auditoria internacionalmente reconhecidas</span>.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  Legal, simples e mundial — do jeito que a internet deveria ser.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Exclusividade e Escassez */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              EXCLUSIVIDADE E ESCASSEZ
            </h2>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-10">
              <div className="space-y-6 text-lg text-gray-300 text-left max-w-3xl mx-auto">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                  <p>
                    <span className="text-white font-semibold">Nomes e números são únicos.</span> Quanto mais curto, raro ou simbólico, maior o valor.
                  </p>
                </div>

                <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20">
                  <p className="text-center mb-4 text-gray-400">Exemplos de alta valorização:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <code className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-mono">1.pix.global</code>
                    <code className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-mono">777.pix.global</code>
                    <code className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-mono">2025.pix.global</code>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Lock className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                  <p>
                    Quando um registro é feito, <span className="text-white font-semibold">ninguém mais pode repetir</span>.
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-purple-500/20">
                <p className="text-2xl font-bold text-center">
                  <span className="text-white">Chegar cedo importa.</span>{' '}
                  <span className="text-purple-400">Os melhores nomes e números estão sendo registrados agora.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-12 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              MANIFESTO
            </h2>

            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-3xl p-12">
              <blockquote className="text-2xl sm:text-3xl font-light leading-relaxed text-gray-200 mb-8">
                Criamos o que o mundo tentou e não conseguiu:<br/>
                uma ponte universal entre <span className="text-amber-400 font-semibold">identidade</span> e <span className="text-amber-400 font-semibold">valor</span>,<br/>
                simples o suficiente para qualquer pessoa usar,<br/>
                sólida o suficiente para operar em qualquer país,<br/>
                e legítima o suficiente para durar décadas.
              </blockquote>

              <div className="flex flex-wrap gap-4 justify-center items-center mb-8 text-xl font-semibold">
                <span className="text-red-400">Sem bancos.</span>
                <span className="text-gray-500">•</span>
                <span className="text-red-400">Sem cripto.</span>
                <span className="text-gray-500">•</span>
                <span className="text-red-400">Sem fronteiras.</span>
              </div>

              <p className="text-xl text-gray-300 mb-8">
                Apenas você, sua identidade e seus números — <span className="text-green-400 font-semibold">vivos e reconhecidos globalmente</span>.
              </p>

              <div className="bg-gradient-to-r from-amber-500/20 to-red-500/20 border-2 border-amber-500/40 rounded-2xl p-8 mb-8">
                <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Pix.Global é a novidade mais disruptiva do momento na convergência entre presença digital, recebimento global e propriedade verificável.
                </p>
              </div>

              <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                É o início da Identidade Global Viva.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-6 h-6" />
                Comece Sua Jornada Agora
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
