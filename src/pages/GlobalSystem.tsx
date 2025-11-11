import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, CheckCircle, Lock, FileText, Building2, Scale } from 'lucide-react';

const GlobalSystem: React.FC = () => {
  const jurisdictions = [
    {
      country: 'Reino Unido',
      framework: 'UK Digital Assets Framework (2023)',
      description: 'Registrado sob a Global Digital Identity LTD (Nº 15830191), o Pix.Global segue as diretrizes do Law Commission of England and Wales para ativos digitais não financeiros.',
      status: 'Em conformidade total'
    },
    {
      country: 'União Europeia',
      framework: 'EU Digital Services Act (2024)',
      description: 'Aderência completa aos padrões de transparência, consentimento e auditoria de dados da UE.',
      status: 'Total conformidade'
    },
    {
      country: 'Estados Unidos',
      framework: 'FinCEN Non-Custodial Digital Assets Guidance',
      description: 'Compatível com a política norte-americana para plataformas que não custodiem nem transmitam dinheiro.',
      status: 'Em conformidade'
    },
    {
      country: 'América Latina / Brasil',
      framework: 'Lei nº 14.478/2022 (Marco Legal dos Ativos Digitais)',
      description: 'Atua exclusivamente com ativos digitais não financeiros, fora do escopo de regulação do Banco Central e da CVM.',
      status: 'Operação legítima e auditável'
    },
    {
      country: 'Canadá',
      framework: 'Digital Charter Implementation Act (2022)',
      description: 'O Pix.Global segue as diretrizes canadenses de governança digital e proteção de dados.',
      status: 'Conformidade total'
    },
    {
      country: 'Emirados Árabes',
      framework: 'Abu Dhabi Global Market – Digital Assets Framework (2023)',
      description: 'Conformidade com normas internacionais de registro digital e tokenização não financeira.',
      status: 'Reconhecido como Registro de Propriedade Digital'
    },
    {
      country: 'Singapura',
      framework: 'Digital Assets and Tokenization Standards (2023)',
      description: 'Compatível com o modelo de ativos digitais auditáveis definidos pela Monetary Authority of Singapore.',
      status: 'Totalmente compatível'
    },
    {
      country: 'Austrália',
      framework: 'Australian Consumer Data Right & Digital Assets Initiative (2023)',
      description: 'Aderente aos princípios de propriedade e transparência em ambientes digitais auditáveis.',
      status: 'Conformidade plena'
    },
    {
      country: 'África do Sul',
      framework: 'Electronic Communications and Transactions Act (ECTA)',
      description: 'Reconhecido como registro digital legítimo sob a legislação africana de bens digitais.',
      status: 'Legal e auditável'
    },
    {
      country: 'OECD',
      framework: 'Digital Economy Guidelines (2023)',
      description: 'Pix.Global segue as boas práticas internacionais de interoperabilidade, transparência e auditoria digital.',
      status: 'Conformidade global'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-40 pb-20">
      {/* Hero Section */}
      <section className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 backdrop-blur-sm border border-[#FFC107]/30 rounded-full px-6 py-2 mb-6">
              <Globe className="w-4 h-4 text-[#FFC107]" />
              <span className="text-[#FFC107] text-xs font-semibold tracking-widest uppercase">Sistema Global</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Sistema Global de <span className="bg-gradient-to-r from-[#FFC107] via-[#FFD54F] to-[#FF9800] bg-clip-text text-transparent">Propriedade Digital</span>
            </h1>

            <p className="text-2xl text-gray-300 mb-4 leading-relaxed">
              A nova estrutura legítima para propriedade digital no mundo.
            </p>

            <p className="text-xl text-gray-400 leading-relaxed">
              Pix.Global conecta nomes, números e identidades sob uma base auditável, legal e transparente — sem bancos, sem cripto, sem fronteiras.
            </p>
          </motion.div>
        </div>
      </section>

      {/* O que é o Sistema */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#FFC107]/10 to-[#FF9800]/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#FFC107]/20">
              <h2 className="text-3xl font-bold text-white mb-6">O que é o Sistema Global</h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  O Sistema Global de Propriedade Digital é a base legal e tecnológica que sustenta o Pix.Global.
                  Ele transforma cada domínio e número .pix.global em um ativo digital legítimo, registrado e auditável.
                </p>
                <p>
                  Quando você registra <span className="text-[#FFC107] font-mono">maria.pix.global</span>, ou recebe um número como <span className="text-[#FFC107] font-mono">9072907237839893833.pix.global</span>, você está adquirindo propriedade digital reconhecida internacionalmente, vinculada à sua identidade global.
                </p>
                <div className="bg-black/40 border border-[#FFC107]/20 rounded-xl p-6 mt-6">
                  <p className="text-white font-semibold mb-2">Importante:</p>
                  <p>
                    Nenhum dinheiro é movimentado. Nenhuma conversão de moeda é feita. Apenas a propriedade legítima de um domínio ou número digital é registrada ou transferida — com auditoria global.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">Como funciona a propriedade digital</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-[#FFC107]/20 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-[#FFC107]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Registro Único</h3>
                <p className="text-gray-400">
                  Cada domínio e número .pix.global é único e irrepetível, garantindo escassez e autenticidade.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-[#FFC107]/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#FFC107]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Validação Global</h3>
                <p className="text-gray-400">
                  Ao ser transferido, o sistema valida autenticidade, registra o novo titular e gera um Recibo Global de Identidade (RGI).
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-[#FFC107]/20 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-[#FFC107]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Auditoria Pública</h3>
                <p className="text-gray-400">
                  Código público de verificação disponível em <span className="text-[#FFC107]">verify.pix.global/[código]</span>.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-3xl p-8 border border-blue-500/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-400" />
                GDI Safe Layer™
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                A GDI Safe Layer™ é a base de confiança digital global. Ela valida cada registro com:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Criptografia ponta a ponta</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Registro imutável de propriedade</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Hash público de verificação</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Validação por gateways oficiais (PayPal, Stripe, Wise)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Dados armazenados em servidores auditados na União Europeia e Reino Unido</span>
                </li>
              </ul>
              <p className="text-gray-400 text-sm mt-6 italic">
                Tecnologia de auditoria e registro global da Global Digital Identity LTD (Reino Unido, Nº 15830191).
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conformidade Legal */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Conformidade Legal Internacional</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Pix.Global é totalmente compatível com os marcos legais internacionais que reconhecem ativos digitais não financeiros.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#FFC107]/10 to-[#FF9800]/5 rounded-3xl p-8 md:p-10 border border-[#FFC107]/20 mb-12">
              <div className="flex items-start gap-4 mb-6">
                <Scale className="w-8 h-8 text-[#FFC107] flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Nossa Posição Legal</h3>
                  <div className="space-y-2 text-gray-300 text-lg">
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-1" />
                      <span>Não somos banco</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-1" />
                      <span>Não processamos dinheiro</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-1" />
                      <span>Não realizamos câmbio</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-1" />
                      <span>Somos infraestrutura de registro e propriedade digital legítima</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {jurisdictions.map((jurisdiction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FFC107]/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{jurisdiction.country}</h3>
                      <p className="text-sm text-[#FFC107] mb-2">{jurisdiction.framework}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                    {jurisdiction.description}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs font-semibold">{jurisdiction.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conclusão */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#FFC107]/10 to-[#FF9800]/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#FFC107]/20 mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">O Novo Padrão Mundial</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                O Pix.Global representa o novo padrão mundial de propriedade digital — legal, auditável e seguro.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Reconhecido em múltiplas jurisdições, ele permite que cada domínio e número .pix.global tenha legitimidade global e valor comprovado.
              </p>
              <div className="bg-black/40 border border-[#FFC107]/20 rounded-xl p-6">
                <p className="text-2xl text-white font-semibold mb-2">
                  Não somos banco. Não somos cripto.
                </p>
                <p className="text-lg text-gray-300">
                  Somos a ponte global entre identidade e valor digital legítimo — auditada e reconhecida mundialmente.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-4">
                Pix.Global — o sistema global de propriedade digital legítima.
              </p>
              <p className="text-xl text-[#FFC107] mb-8">
                Tudo auditável. Tudo registrado. Tudo seu.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Informação Legal Adicional */}
      <section className="border-t border-white/10 py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Operado pela <strong className="text-white">Global Digital Identity LTD</strong> (Company Nº 15830191 — registrada na Inglaterra e País de Gales).
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Conformidade com UK Digital Assets Framework (2023), EU Digital Services Act (2024), Lei Brasileira 14.478/2022, US FinCEN Guidance e OECD Digital Guidelines (2023). Pagamentos processados via PayPal, Stripe e Wise, sem custódia de valores. Propriedade e auditoria asseguradas globalmente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GlobalSystem;
