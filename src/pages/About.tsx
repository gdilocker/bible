import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Shield, Zap, Check, ArrowRight, Sparkles } from 'lucide-react';

const About = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      {/* Hero Section */}
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
                Sobre o Pix.Global
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-tight"
            >
              <motion.span
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
              >
                O Sistema que o Mundo Não Conseguiu Criar
              </motion.span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-6 text-lg sm:text-xl text-gray-300"
            >
              <motion.p
                className="leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                Durante décadas, governos e bancos tentaram criar um sistema global de pagamentos. Todos falharam. O Pix.Global nasceu para resolver isso.
              </motion.p>

              <motion.p
                className="text-xl sm:text-2xl text-white font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                Criamos uma estrutura independente e legítima que une identidade e valor digital sem depender de instituições financeiras ou criptomoedas. 100% dentro da legalidade internacional.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Como Funciona */}
      <section className="relative bg-slate-950 py-20">
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
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8"
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
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Cada registro .pix.global cria dois elementos interligados que formam a base de uma nova economia digital.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Identidade */}
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
                <h3 className="text-2xl font-bold text-white">Identidade (Nome Digital)</h3>
              </div>
              <p className="text-gray-300 mb-4 relative z-10">
                Representa quem você é. Seu endereço global exclusivo e verificável.
              </p>
              <motion.div
                className="bg-black/30 rounded-xl p-4 relative z-10"
                whileHover={{
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
                }}
              >
                <p className="text-blue-400 font-mono text-lg">maria.pix.global</p>
              </motion.div>
            </motion.div>

            {/* Ativo Numérico */}
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
                <h3 className="text-2xl font-bold text-white">Ativo Numérico (Valor Digital)</h3>
              </div>
              <p className="text-gray-300 mb-4 relative z-10">
                Representa o valor que você pode transferir, trocar ou armazenar digitalmente.
              </p>
              <motion.div
                className="bg-black/30 rounded-xl p-4 relative z-10"
                whileHover={{
                  boxShadow: "0 0 30px rgba(234, 179, 8, 0.5)"
                }}
              >
                <p className="text-yellow-400 font-mono text-sm sm:text-base break-all">9072907237839893833.pix.global</p>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border-2 border-cyan-500/40 rounded-2xl p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
              animate={{
                x: ["-100%", "200%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <p className="text-xl text-white font-semibold relative z-10">
              Esses dois componentes convivem sob um mesmo domínio global, formando a base de uma economia digital transparente, legal e auditável.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Por que é Legal */}
      <section className="relative bg-black py-20">
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

            <motion.div
              className="flex items-center justify-center mb-8 relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Shield className="w-8 h-8 text-black" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Por que é Legal no Mundo Todo
            </motion.h2>

            <div className="space-y-6 relative z-10">
              <motion.p
                className="text-lg sm:text-xl text-slate-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                O Pix.Global é uma plataforma de <span className="text-yellow-400 font-semibold">ativos digitais não financeiros</span>, operando sob as leis internacionais que regulam registros e propriedades digitais.
              </motion.p>

              <motion.div
                className="grid sm:grid-cols-3 gap-4 py-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                {[
                  "Não somos banco",
                  "Não somos criptomoeda",
                  "Legitimidade global"
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    className="bg-black/20 rounded-xl p-4 border border-yellow-500/20"
                    whileHover={{
                      scale: 1.05,
                      borderColor: "rgba(234, 179, 8, 0.5)"
                    }}
                  >
                    <p className="text-white font-semibold">{text}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p
                className="text-xl sm:text-2xl text-white font-bold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                Somos a ponte entre identidade e valor. Com legitimidade global.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Final */}
      <section className="relative bg-slate-950 py-20">
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
              Pix.Global é a evolução natural da economia digital
            </motion.p>

            <motion.p
              className="text-xl text-slate-300 mb-10 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Uma tecnologia independente que o mundo inteiro pode usar. De forma livre, legal e global.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-400/60 hover:scale-105 group relative z-10"
              >
                Registrar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
