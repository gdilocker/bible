import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Building2, Globe, CreditCard, Shield, Users, Clock, FileText, AlertCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
  keywords: string[];
}

interface FAQSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const faqSections: FAQSection[] = [
    {
      id: 'intro',
      title: 'Sobre o Pix.Global',
      icon: <Building2 className="w-5 h-5" />,
      items: [
        {
          question: '1. O que é o Pix.Global?',
          keywords: ['pix', 'global', 'plataforma', 'identidade', 'dominio'],
          answer: (
            <div className="space-y-3">
              <p>Pix.Global é uma <strong>plataforma mundial de identidade e propriedade digital</strong>, onde cada pessoa, empresa ou projeto pode registrar um domínio exclusivo dentro da extensão <strong>.pix.global</strong>.</p>

              <p className="font-semibold mt-4">Existem dois tipos principais de domínios:</p>

              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <h4 className="font-bold mb-2">1.1 Domínios Personalizados – Identidades Digitais</h4>
                <p className="mb-2">São nomes escolhidos pelo usuário, como <code className="bg-gray-200 px-2 py-1 rounded">maria.pix.global</code> ou <code className="bg-gray-200 px-2 py-1 rounded">empresa.pix.global</code>.</p>
                <p>Eles representam <strong>identidades digitais verificadas</strong>, ideais para uso pessoal, profissional ou corporativo.</p>
                <p className="mt-2">Cada domínio personalizado inclui:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Painel de controle para gestão completa</li>
                  <li>Caixa de e-mail integrada (nome@pix.global)</li>
                  <li>Endereço digital exclusivo</li>
                  <li>Renovação anual para manutenção da infraestrutura, DNS e suporte</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <h4 className="font-bold mb-2">1.2 Domínios Numéricos – Ativos Digitais</h4>
                <p className="mb-2">São sequências únicas de números, como <code className="bg-gray-200 px-2 py-1 rounded">748373382982838373.pix.global</code>.</p>
                <p>Eles funcionam como <strong>ativos digitais permanentes</strong>, registrados uma única vez e sem cobrança de anuidade.</p>
                <p className="mt-2">Cada domínio numérico:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>É vendido uma única vez (pagamento único e definitivo)</li>
                  <li>Pode ser transferido entre usuários dentro da plataforma</li>
                  <li>Representa uma chave digital exclusiva ou ativo colecionável</li>
                  <li>Não exige renovação nem taxas de manutenção</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="font-semibold">Resumo:</p>
                <p className="mt-1"><code className="bg-blue-100 px-2 py-1 rounded">maria.pix.global</code> → <strong>Identidade digital personalizada</strong> (com e-mail e renovação anual)</p>
                <p className="mt-1"><code className="bg-blue-100 px-2 py-1 rounded">748373382982838373.pix.global</code> → <strong>Ativo digital numérico permanente</strong> (sem anuidade, transferível)</p>
              </div>
            </div>
          )
        },
        {
          question: '2. Qual é o propósito do Pix.Global?',
          keywords: ['proposito', 'missao', 'objetivo'],
          answer: 'O Pix.Global tem como missão conectar identidade, propriedade e pagamento digital em um mesmo ecossistema. A plataforma oferece uma nova forma de possuir e gerenciar nomes e números globais, usados como endereços digitais, chaves de pagamento e ativos tecnológicos únicos.'
        },
        {
          question: '3. Quem pode usar o Pix.Global?',
          keywords: ['quem', 'usuario', 'publico'],
          answer: 'Qualquer pessoa física, empresa, marca, criador de conteúdo ou instituição que deseje possuir uma identidade digital exclusiva ou um ativo digital numerado dentro do domínio .pix.global.'
        }
      ]
    },
    {
      id: 'assets',
      title: 'Ativos e Transferências',
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          question: '4. O que é um ativo digital dentro do Pix.Global?',
          keywords: ['ativo', 'digital', 'propriedade'],
          answer: 'É um domínio numérico único .pix.global, que pertence integralmente ao comprador e pode ser transferido a outro usuário dentro da plataforma. Não representa investimento financeiro, e sim propriedade digital permanente.'
        },
        {
          question: '5. Posso transferir meu domínio para outra pessoa?',
          keywords: ['transferir', 'transferencia', 'venda'],
          answer: 'Sim. O titular pode transferir seu domínio para outro usuário do Pix.Global, de forma segura e auditável. A empresa não intermedeia nem se responsabiliza por negociações entre usuários.'
        },
        {
          question: '6. Os domínios têm anuidade?',
          keywords: ['anuidade', 'renovacao', 'pagamento'],
          answer: (
            <div className="space-y-2">
              <p><strong>Domínios Personalizados:</strong> Sim, possuem anuidade para cobrir infraestrutura, e-mail e suporte.</p>
              <p><strong>Domínios Numéricos:</strong> Não. São permanentes, sem custos recorrentes.</p>
            </div>
          )
        },
        {
          question: '7. O que acontece se eu não renovar um domínio personalizado?',
          keywords: ['renovacao', 'expiracao', 'suspensao'],
          answer: 'O domínio será suspenso e, após o prazo de tolerância, liberado para nova compra. Domínios numéricos não exigem renovação.'
        }
      ]
    },
    {
      id: 'credits',
      title: 'Créditos Pix.Global',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: '8. O que são os créditos Pix.Global?',
          keywords: ['creditos', 'moeda', 'saldo'],
          answer: (
            <div className="space-y-2">
              <p>São <strong>unidades digitais internas</strong> da plataforma, usadas para:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Comprar ou renovar domínios</li>
                <li>Receber comissões por vendas realizadas</li>
                <li>Efetuar transações dentro do sistema</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">Os créditos não são moeda real, não são conversíveis em dinheiro e têm uso exclusivo dentro da plataforma.</p>
            </div>
          )
        },
        {
          question: '9. Os créditos Pix.Global podem ser transferidos ou sacados?',
          keywords: ['saque', 'transferir', 'creditos'],
          answer: 'Não. Os créditos são de uso interno e não podem ser convertidos, transferidos ou sacados. Eles representam utilidade digital, não valor financeiro.'
        },
        {
          question: '10. Os créditos Pix.Global expiram?',
          keywords: ['expiracao', 'validade', 'creditos'],
          answer: 'Não. Créditos válidos permanecem disponíveis enquanto a conta estiver ativa e em conformidade com os Termos de Uso.'
        }
      ]
    },
    {
      id: 'commission',
      title: 'Programa de Comissionamento',
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          question: '11. O que é o Programa de Comissionamento Pix.Global?',
          keywords: ['comissao', 'afiliado', 'parceiro'],
          answer: 'É o sistema que recompensa parceiros por vendas reais e confirmadas de domínios e serviços digitais dentro da plataforma. As comissões são creditadas em créditos Pix.Global, após validação da venda.'
        },
        {
          question: '12. Como recebo comissões?',
          keywords: ['receber', 'comissao', 'pagamento'],
          answer: 'Quando uma venda é realizada através do seu link oficial de parceiro, a transação é registrada e validada. Após confirmação do pagamento, a comissão é creditada automaticamente em créditos Pix.Global.'
        },
        {
          question: '13. Existe pagamento por cadastros, cliques ou visitas?',
          keywords: ['cadastro', 'clique', 'visita'],
          answer: 'Não. As comissões são exclusivamente sobre vendas confirmadas. Não há remuneração por acessos, cadastros ou interações.'
        },
        {
          question: '14. Como são calculadas as comissões?',
          keywords: ['calculo', 'percentual', 'comissao'],
          answer: 'Com base no valor líquido recebido pela plataforma, já deduzidas taxas e custos. O percentual é definido e divulgado oficialmente pelo Pix.Global, podendo variar conforme o tipo de produto ou serviço.'
        },
        {
          question: '15. Quando as comissões são liberadas?',
          keywords: ['liberacao', 'prazo', 'comissao'],
          answer: 'Após a confirmação de pagamento e verificação interna, normalmente em até 30 dias.'
        },
        {
          question: '16. Onde posso acompanhar minhas comissões e histórico?',
          keywords: ['painel', 'historico', 'acompanhar'],
          answer: (
            <div className="space-y-2">
              <p>No <strong>Painel de Parceiro</strong>, que exibe:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Vendas realizadas</li>
                <li>Status de confirmação</li>
                <li>Créditos acumulados</li>
                <li>Percentuais e regras vigentes</li>
              </ul>
            </div>
          )
        },
        {
          question: '17. Posso transferir minhas comissões para outra conta?',
          keywords: ['transferir', 'comissao', 'conta'],
          answer: 'Não. Créditos Pix.Global são pessoais, intransferíveis e devem ser usados na própria conta.'
        },
        {
          question: '18. O programa de comissionamento é legal e transparente?',
          keywords: ['legal', 'transparente', 'programa'],
          answer: 'Sim. O programa é totalmente legítimo, baseado em vendas reais e verificadas, sem estrutura multinível, renda passiva ou promessa de lucro. Segue padrões de conformidade internacional e a legislação britânica (Consumer Rights Act 2015, Data Protection Act 2018 e GDPR).'
        },
        {
          question: '19. Existe vínculo empregatício com a empresa?',
          keywords: ['vinculo', 'emprego', 'trabalhista'],
          answer: 'Não. O parceiro atua de forma autônoma e independente, sem vínculo trabalhista ou societário com a Global Digital Identity LTD.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Pagamentos e Reembolsos',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: '20. Quais são os métodos de pagamento aceitos?',
          keywords: ['pagamento', 'metodo', 'paypal'],
          answer: (
            <div className="space-y-2">
              <p><strong>PayPal:</strong> para compra de domínios e serviços digitais.</p>
              <p><strong>Créditos Pix.Global:</strong> para transações internas, comissões e renovações.</p>
              <p className="mt-3">O PayPal <strong>não é usado</strong> para movimentar créditos internos.</p>
            </div>
          )
        },
        {
          question: '21. O Pix.Global é um banco ou sistema financeiro?',
          keywords: ['banco', 'financeiro', 'pagamento'],
          answer: 'Não. É uma plataforma de identidade e propriedade digital, que opera com créditos internos e ativos digitais, sem conversão em moeda real.'
        },
        {
          question: '22. Posso pedir reembolso de um domínio?',
          keywords: ['reembolso', 'devolucao', 'cancelamento'],
          answer: 'Não. Como cada domínio é único e personalizado, o pagamento é definitivo após a confirmação da compra.'
        },
        {
          question: '23. O que acontece em caso de fraude ou manipulação de vendas?',
          keywords: ['fraude', 'manipulacao', 'seguranca'],
          answer: 'A conta será suspensa e as comissões canceladas. Casos suspeitos passam por auditoria interna e podem ser reportados às autoridades competentes.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Suporte e Notificações',
      icon: <AlertCircle className="w-5 h-5" />,
      items: [
        {
          question: '24. Como recebo notificações e confirmações?',
          keywords: ['notificacao', 'email', 'confirmacao'],
          answer: 'A plataforma envia e-mails automáticos via Mailcow, confirmando cadastro, pagamento, domínio e avisos do sistema. O uso de e-mails externos (Titan, Zoho etc.) foi descontinuado.'
        },
        {
          question: '27. Onde posso obter suporte ou informações adicionais?',
          keywords: ['suporte', 'ajuda', 'contato'],
          answer: (
            <div className="space-y-2">
              <p>Pelo <strong>painel de suporte do usuário</strong> dentro da plataforma, ou pelos canais de contato oficiais exibidos no site.</p>
              <p className="mt-3">As políticas completas estão disponíveis em:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Termos de Uso</li>
                <li>Política de Privacidade</li>
                <li>Programa de Comissionamento</li>
                <li>FAQ</li>
              </ul>
            </div>
          )
        }
      ]
    },
    {
      id: 'innovation',
      title: 'Inovação e Empresa',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          question: '25. O que torna o Pix.Global inovador?',
          keywords: ['inovacao', 'diferencial', 'unico'],
          answer: (
            <div className="space-y-2">
              <p>O Pix.Global une três pilares em um único ecossistema:</p>
              <ol className="list-decimal ml-6 mt-2 space-y-2">
                <li><strong>Identidade Digital Global</strong> (domínios personalizados com e-mail e presença pública)</li>
                <li><strong>Propriedade Digital Permanente</strong> (domínios numéricos exclusivos e sem anuidade)</li>
                <li><strong>Sistema de Créditos e Comissões</strong> (ecossistema interno para recompensas e transações)</li>
              </ol>
              <p className="mt-3 font-semibold">É o primeiro sistema que transforma nomes e números em identidades e ativos digitais globais.</p>
            </div>
          )
        },
        {
          question: '26. A Pix.Global é uma empresa registrada oficialmente?',
          keywords: ['empresa', 'registro', 'legal'],
          answer: (
            <div className="space-y-2">
              <p>Sim. O Pix.Global é operado pela <strong>Global Digital Identity LTD</strong>, registrada na <strong>Companies House (Reino Unido)</strong> sob o nº <strong>16339013</strong>, seguindo padrões legais britânicos e europeus.</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="font-semibold">Global Digital Identity LTD</p>
                <p>Registered in England and Wales</p>
                <p>Company No. 16339013</p>
                <p>71-75 Shelton Street, Covent Garden</p>
                <p>London, WC2H 9JQ, United Kingdom</p>
              </div>
            </div>
          )
        },
        {
          question: '28. Qual é o foro jurídico da plataforma?',
          keywords: ['foro', 'jurisdicao', 'legal'],
          answer: 'O foro competente é o da Cidade de Londres, Inglaterra, conforme os Termos Oficiais de Uso e Comissionamento.'
        }
      ]
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return faqSections;

    const query = searchQuery.toLowerCase();
    return faqSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const questionMatch = item.question.toLowerCase().includes(query);
          const keywordMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(query));
          const answerMatch = typeof item.answer === 'string'
            ? item.answer.toLowerCase().includes(query)
            : false;
          return questionMatch || keywordMatch || answerMatch;
        })
      }))
      .filter(section => section.items.length > 0);
  }, [searchQuery, faqSections]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6">
              <HelpCircle className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              FAQ – Pix.Global
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Identidade e Propriedade Digital Mundial
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por palavra-chave (ex: comissão, créditos, transferência)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            {searchQuery && (
              <p className="text-center text-gray-400 mt-3 text-sm">
                {filteredSections.reduce((acc, section) => acc + section.items.length, 0)} resultado(s) encontrado(s)
              </p>
            )}
          </motion.div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {filteredSections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700"
              >
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Nenhum resultado encontrado para "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  Limpar busca
                </button>
              </motion.div>
            ) : (
              filteredSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * sectionIndex }}
                  className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                    </div>
                  </div>

                  {/* Section Items */}
                  <div className="divide-y divide-gray-700">
                    {section.items.map((item, itemIndex) => {
                      const itemId = `${section.id}-${itemIndex}`;
                      const isOpen = openItems.has(itemId);

                      return (
                        <div key={itemId} className="transition-colors hover:bg-gray-750">
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left group"
                          >
                            <span className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors flex-1 pr-4">
                              {item.question}
                            </span>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                                  {typeof item.answer === 'string' ? (
                                    <p>{item.answer}</p>
                                  ) : (
                                    item.answer
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 border border-gray-600"
          >
            <FileText className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Ainda tem dúvidas?</h3>
            <p className="text-gray-400 mb-6">
              Entre em contato com nossa equipe de suporte ou consulte nossa documentação completa
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/suporte"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Abrir Ticket de Suporte
              </a>
              <a
                href="/termos"
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
              >
                Ver Termos de Uso
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
