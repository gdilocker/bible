import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Zap, Globe, Shield } from 'lucide-react';

const Manifesto = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/30 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Manifesto */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-black to-blue-950"
          style={{ opacity, scale }}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/15 via-transparent to-transparent"
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent"
            animate={{
              opacity: [0.15, 0.25, 0.15],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </motion.div>

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
              <motion.span
                className="inline-block bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-6"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.3)",
                    "0 0 40px rgba(234, 179, 8, 0.5)",
                    "0 0 20px rgba(234, 179, 8, 0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                O Sistema que o Mundo Não Conseguiu Criar
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight"
            >
              <motion.span
                className="text-white block mb-3"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                O mundo tentou criar um sistema global de pagamentos.
              </motion.span>
              <motion.span
                className="text-slate-300 block text-3xl sm:text-4xl lg:text-5xl mb-3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Nenhum governo conseguiu. Nenhum banco conseguiu.
              </motion.span>
              <motion.span
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.9,
                  type: "spring",
                  stiffness: 100
                }}
                whileInView={{
                  textShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.5)",
                    "0 0 40px rgba(234, 179, 8, 0.8)",
                    "0 0 20px rgba(234, 179, 8, 0.5)"
                  ]
                }}
              >
                Nós conseguimos.
              </motion.span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="space-y-6 text-lg sm:text-xl text-gray-300"
            >
              <motion.p
                className="leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                Durante décadas, o planeta buscou um sistema que permitisse enviar e receber valores de forma direta, sem depender de fronteiras, moedas ou bancos.
              </motion.p>

              <div className="space-y-3 text-xl sm:text-2xl">
                {[
                  "Os governos criaram barreiras.",
                  "Os bancos criaram taxas.",
                  "As criptomoedas criaram promessas."
                ].map((text, i) => (
                  <motion.p
                    key={i}
                    className="text-slate-400 font-light"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + i * 0.2 }}
                  >
                    {text}
                  </motion.p>
                ))}
              </div>

              <motion.p
                className="text-xl sm:text-2xl text-white font-semibold pt-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                Mas ninguém criou uma ponte real entre identidade, valor e legitimidade global. Até agora.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* A Solução */}
      <section className="relative bg-slate-950 py-20">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border-2 border-yellow-500/30 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
            whileInView={{
              boxShadow: [
                "0 0 40px rgba(234, 179, 8, 0.1)",
                "0 0 80px rgba(234, 179, 8, 0.3)",
                "0 0 40px rgba(234, 179, 8, 0.1)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.3), transparent)"
              }}
              animate={{
                x: ["-100%", "200%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              O Pix.Global é a primeira infraestrutura mundial que une identidade e valor digital
            </motion.h2>
            <motion.p
              className="text-xl sm:text-2xl text-gray-200 mb-6 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.span
                className="text-yellow-400 font-semibold"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(234, 179, 8, 0.5)",
                    "0 0 20px rgba(234, 179, 8, 0.8)",
                    "0 0 10px rgba(234, 179, 8, 0.5)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Sem ser instituição financeira
              </motion.span> e em total conformidade com as leis internacionais.
            </motion.p>
            <motion.p
              className="text-lg sm:text-xl text-slate-300 leading-relaxed relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              É a resposta a um desafio que governos e bancos nunca conseguiram resolver. Criar um sistema mundial de identidade e valor. Livre, legítimo e global.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section className="relative bg-black py-20">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              whileInView={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Como Funciona
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              O Pix.Global transforma nomes e números em identidades e valores digitais.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Domínio Nominal */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 60px rgba(59, 130, 246, 0.4)"
              }}
              className="bg-gradient-to-br from-blue-600/15 to-blue-700/5 border-2 border-blue-500/40 rounded-2xl p-8 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Globe className="w-6 h-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Seu domínio nominal</h3>
              </div>
              <motion.div
                className="bg-black/30 rounded-xl p-4 mb-6 relative z-10"
                whileHover={{
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
                }}
              >
                <p className="text-blue-400 font-mono text-lg">joaosilva.pix.global</p>
              </motion.div>
              <ul className="space-y-3 relative z-10">
                {[
                  "Representa sua identidade digital global",
                  "É seu endereço público e verificável",
                  "Pode ser usado em perfis, cartões digitais, sites e conexões profissionais"
                ].map((text, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Domínio Numérico */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 60px rgba(234, 179, 8, 0.4)"
              }}
              className="bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border-2 border-yellow-500/40 rounded-2xl p-8 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-black font-bold text-xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Seu domínio numérico</h3>
              </div>
              <motion.div
                className="bg-black/30 rounded-xl p-4 mb-6 relative z-10"
                whileHover={{
                  boxShadow: "0 0 30px rgba(234, 179, 8, 0.5)"
                }}
              >
                <p className="text-yellow-400 font-mono text-sm sm:text-base break-all">9072907237839893833.pix.global</p>
              </motion.div>
              <ul className="space-y-3 relative z-10">
                {[
                  "É um ativo digital exclusivo e transferível",
                  "Pode ser usado como identificador em negociações, trocas e pagamentos digitais",
                  "Possui valor simbólico e utilitário, podendo ser transferido entre pessoas e empresas"
                ].map((text, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bloco de destaque */}
          <motion.div
            className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/15 border-2 border-yellow-500/40 rounded-2xl p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{
              boxShadow: "0 0 80px rgba(234, 179, 8, 0.4)"
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
              animate={{
                x: ["-100%", "200%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.p
              className="text-2xl sm:text-3xl font-bold text-white mb-2 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Governos criaram barreiras. Bancos criaram taxas.
            </motion.p>
            <motion.p
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              animate={{
                textShadow: [
                  "0 0 20px rgba(234, 179, 8, 0.5)",
                  "0 0 40px rgba(234, 179, 8, 0.8)",
                  "0 0 20px rgba(234, 179, 8, 0.5)"
                ]
              }}
            >
              O Pix.Global criou liberdade.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Como o Valor Circula */}
      <section className="relative bg-slate-950 py-20">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-transparent to-transparent"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              whileInView={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Como o Valor Circula
            </motion.h2>
          </motion.div>

          <div className="prose prose-lg prose-invert max-w-none mb-10">
            {[
              "No Pix.Global, o valor circula através da propriedade digital.",
              "Quando você adquire um domínio, você não compra uma moeda. Você adquire um ativo digital legítimo, com valor simbólico e utilitário.",
              "Esses ativos podem ser trocados ou transferidos entre usuários, empresas ou plataformas, representando valor de forma imediata e global. Sem conversão de moeda, sem banco e sem fronteira."
            ].map((text, i) => (
              <motion.p
                key={i}
                className={`text-lg sm:text-xl leading-relaxed mb-6 ${i === 1 ? 'text-slate-300' : i === 2 ? 'text-slate-300' : 'text-gray-300'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
              >
                {i === 1 ? (
                  <>
                    Quando você adquire um domínio, você não compra uma moeda. Você adquire um <span className="text-cyan-400 font-semibold">ativo digital legítimo</span>, com valor simbólico e utilitário.
                  </>
                ) : i === 2 ? (
                  <>
                    Esses ativos podem ser trocados ou transferidos entre usuários, empresas ou plataformas, representando valor de forma imediata e global. <span className="text-white font-semibold">Sem conversão de moeda, sem banco e sem fronteira.</span>
                  </>
                ) : text}
              </motion.p>
            ))}
          </div>

          {/* Exemplo Prático */}
          <motion.div
            className="bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border-2 border-cyan-500/40 rounded-2xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{
              boxShadow: "0 0 60px rgba(6, 182, 212, 0.4)"
            }}
          >
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.h3
              className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.span
                className="text-cyan-400"
                animate={{
                  x: [0, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                →
              </motion.span>
              Exemplo Prático
            </motion.h3>

            <div className="space-y-4 text-slate-300 relative z-10">
              {[
                { text: "Você registra", highlight: "maria.pix.global", text2: "e recebe um ativo numérico equivalente a", highlight2: "$25" },
                { text: "Precisa comprar um produto de", highlight2: "$100", text2: "?" },
                { text: "Basta transferir", highlight: "quatro ativos de $25", text2: "para o vendedor. A troca do domínio equivale à transferência de valor." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i }}
                >
                  <motion.div
                    className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.4 }}
                  >
                    {i + 1}
                  </motion.div>
                  <p className="text-base sm:text-lg">
                    {item.text} {item.highlight && <span className="text-yellow-400 font-mono">{item.highlight}</span>} {item.text2} {item.highlight2 && <span className="text-white font-semibold">{item.highlight2}</span>}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-6 pt-6 border-t border-cyan-500/30 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.p
                className="text-center text-white font-semibold text-lg"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(6, 182, 212, 0.3)",
                    "0 0 20px rgba(6, 182, 212, 0.6)",
                    "0 0 10px rgba(6, 182, 212, 0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Tudo é auditável, transparente e totalmente legal em qualquer país do mundo.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Final */}
      <section className="relative bg-black py-20">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-blue-600/10 to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="bg-gradient-to-br from-yellow-500/20 to-blue-600/10 border-2 border-yellow-500/40 rounded-3xl p-10 sm:p-16 relative overflow-hidden"
            whileHover={{
              boxShadow: "0 0 100px rgba(234, 179, 8, 0.4)"
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent"
              animate={{
                x: ["-100%", "200%"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <motion.div
              className="mb-8 relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-6"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Sparkles className="w-10 h-10 text-black" />
              </motion.div>
            </motion.div>

            <motion.p
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 leading-tight relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Pix.Global. A ponte entre o mundo real e o digital
            </motion.p>

            <motion.p
              className="text-xl text-slate-300 mb-10 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Sem bancos. Sem criptomoedas. Com legitimidade mundial.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/valores"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-400/60 hover:scale-105 group relative z-10"
              >
                Ver Planos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Manifesto;
