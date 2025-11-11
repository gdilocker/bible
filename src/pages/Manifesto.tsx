import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

const Manifesto = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Hero Manifesto */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-black to-blue-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/15 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent"></div>
        </div>

        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-block bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-6">
                O Sistema que o Mundo Não Conseguiu Criar
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight"
            >
              <span className="text-white block mb-3">
                O mundo tentou criar um sistema global de pagamentos.
              </span>
              <span className="text-slate-300 block text-3xl sm:text-4xl lg:text-5xl mb-3">
                Nenhum governo conseguiu. Nenhum banco conseguiu.
              </span>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                Nós conseguimos.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6 text-lg sm:text-xl text-gray-300"
            >
              <p className="leading-relaxed">
                Durante décadas, o planeta buscou um sistema que permitisse enviar e receber valores de forma direta, sem depender de fronteiras, moedas ou bancos.
              </p>

              <div className="space-y-3 text-xl sm:text-2xl">
                <p className="text-slate-400 font-light">Os governos criaram barreiras.</p>
                <p className="text-slate-400 font-light">Os bancos criaram taxas.</p>
                <p className="text-slate-400 font-light">As criptomoedas criaram promessas.</p>
              </div>

              <p className="text-xl sm:text-2xl text-white font-semibold pt-6">
                Mas ninguém criou uma ponte real entre identidade, valor e legitimidade global. Até agora.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* A Solução */}
      <section className="relative bg-slate-950 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border-2 border-yellow-500/30 rounded-3xl p-10 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              O Pix.Global é a primeira infraestrutura mundial que une identidade e valor digital
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 mb-6">
              <span className="text-yellow-400 font-semibold">Sem ser instituição financeira</span> e em total conformidade com as leis internacionais.
            </p>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              É a resposta a um desafio que governos e bancos nunca conseguiram resolver. Criar um sistema mundial de identidade e valor. Livre, legítimo e global.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section className="relative bg-black py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              O Pix.Global transforma nomes e números em identidades e valores digitais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Domínio Nominal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600/15 to-blue-700/5 border-2 border-blue-500/40 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white">Seu domínio nominal</h3>
              </div>
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <p className="text-blue-400 font-mono text-lg">joaosilva.pix.global</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Representa sua identidade digital global</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">É seu endereço público e verificável</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Pode ser usado em perfis, cartões digitais, sites e conexões profissionais</span>
                </li>
              </ul>
            </motion.div>

            {/* Domínio Numérico */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border-2 border-yellow-500/40 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-black font-bold text-xl">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white">Seu domínio numérico</h3>
              </div>
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <p className="text-yellow-400 font-mono text-sm sm:text-base break-all">9072907237839893833.pix.global</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">É um ativo digital exclusivo e transferível</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Pode ser usado como identificador em negociações, trocas e pagamentos digitais</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Possui valor simbólico e utilitário, podendo ser transferido entre pessoas e empresas</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Bloco de destaque */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/15 border-2 border-yellow-500/40 rounded-2xl p-10 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Governos criaram barreiras. Bancos criaram taxas.
            </p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              O Pix.Global criou liberdade.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Como o Valor Circula */}
      <section className="relative bg-slate-950 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-transparent to-transparent"></div>
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Como o Valor Circula
            </h2>
          </div>

          <div className="prose prose-lg prose-invert max-w-none mb-10">
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-6">
              No Pix.Global, o valor circula através da propriedade digital.
            </p>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-6">
              Quando você adquire um domínio, você não compra uma moeda. Você adquire um <span className="text-cyan-400 font-semibold">ativo digital legítimo</span>, com valor simbólico e utilitário.
            </p>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
              Esses ativos podem ser trocados ou transferidos entre usuários, empresas ou plataformas, representando valor de forma imediata e global. <span className="text-white font-semibold">Sem conversão de moeda, sem banco e sem fronteira.</span>
            </p>
          </div>

          {/* Exemplo Prático */}
          <div className="bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border-2 border-cyan-500/40 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">→</span> Exemplo Prático
            </h3>

            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">1</div>
                <p className="text-base sm:text-lg">Você registra <span className="text-yellow-400 font-mono">maria.pix.global</span> e recebe um ativo numérico equivalente a <span className="text-white font-semibold">$25</span></p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">2</div>
                <p className="text-base sm:text-lg">Precisa comprar um produto de <span className="text-white font-semibold">$100</span>?</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">3</div>
                <p className="text-base sm:text-lg">Basta transferir <span className="text-yellow-400 font-semibold">quatro ativos de $25</span> para o vendedor. A troca do domínio equivale à transferência de valor.</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-cyan-500/30">
              <p className="text-center text-white font-semibold text-lg">
                Tudo é auditável, transparente e totalmente legal em qualquer país do mundo.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Final */}
      <section className="relative bg-black py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-blue-600/10 to-transparent"></div>
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-br from-yellow-500/20 to-blue-600/10 border-2 border-yellow-500/40 rounded-3xl p-10 sm:p-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight">
              Pix.Global. A ponte entre o mundo real e o digital
            </p>

            <p className="text-xl text-slate-300 mb-10">
              Sem bancos. Sem criptomoedas. Com legitimidade mundial.
            </p>

            <Link
              to="/valores"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-400/60 hover:scale-105 group"
            >
              Ver Planos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Manifesto;
