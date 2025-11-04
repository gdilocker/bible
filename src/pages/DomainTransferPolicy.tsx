import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Calendar, Shield } from 'lucide-react';

const DomainTransferPolicy: React.FC = () => {
  const sections = [
    {
      title: '1. TRANSFERÊNCIAS PERMITIDAS',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>
            Você pode transferir seu domínio para outro registrador ou para outra conta dentro da Global Digital Identity, desde que atenda aos requisitos estabelecidos.
          </p>
        </div>
      )
    },
    {
      title: '2. REQUISITOS PARA TRANSFERÊNCIA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Para iniciar uma transferência, o domínio deve:</p>
          <ul className="space-y-2 text-[#6B7280]/70 list-disc list-inside">
            <li>Ter pelo menos 60 dias desde o registro ou última transferência</li>
            <li>Estar desbloqueado (sem status "clientTransferProhibited")</li>
            <li>Possuir código de autorização (EPP/Auth Code) válido</li>
            <li>Ter informações de contato atualizadas e verificadas</li>
            <li>Não estar em disputa ou processo legal</li>
            <li>Não estar expirado há mais de 30 dias</li>
          </ul>
        </div>
      )
    },
    {
      title: '3. PROCESSO DE TRANSFERÊNCIA SAÍDA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Para transferir seu domínio para outro registrador:</p>
          <ol className="space-y-2 text-[#6B7280]/70 list-decimal list-inside">
            <li>Acesse o painel de controle e localize o domínio</li>
            <li>Desbloqueie o domínio removendo a proteção de transferência</li>
            <li>Solicite o código de autorização (EPP Code)</li>
            <li>Forneça o código ao novo registrador</li>
            <li>Aprove a transferência quando receber o email de confirmação</li>
          </ol>
          <p>A transferência geralmente leva de 5 a 7 dias para ser concluída.</p>
        </div>
      )
    },
    {
      title: '4. PROCESSO DE TRANSFERÊNCIA ENTRADA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Para transferir um domínio para a Global Digital Identity:</p>
          <ol className="space-y-2 text-[#6B7280]/70 list-decimal list-inside">
            <li>Obtenha o código de autorização do registrador atual</li>
            <li>Desbloqueie o domínio no registrador atual</li>
            <li>Inicie o processo de transferência em nosso site</li>
            <li>Insira o código de autorização quando solicitado</li>
            <li>Confirme a transferência através do email enviado</li>
          </ol>
        </div>
      )
    },
    {
      title: '5. CUSTOS DE TRANSFERÊNCIA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Transferências de domínio geralmente incluem:</p>
          <ul className="space-y-2 text-[#6B7280]/70 list-disc list-inside">
            <li>Taxa de transferência que equivale a 1 ano de renovação</li>
            <li>Adição de 1 ano ao período de registro atual</li>
            <li>Sem taxas ocultas ou custos adicionais</li>
          </ul>
        </div>
      )
    },
    {
      title: '6. CANCELAMENTO DE TRANSFERÊNCIA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Transferências podem ser canceladas:</p>
          <ul className="space-y-2 text-[#6B7280]/70 list-disc list-inside">
            <li>Pelo registrador atual dentro de 5 dias</li>
            <li>Pelo titular do domínio a qualquer momento antes da conclusão</li>
            <li>Automaticamente se não aprovada em 5 dias</li>
          </ul>
          <p>Se você não autorizou uma transferência, negue-a imediatamente através do email de confirmação.</p>
        </div>
      )
    },
    {
      title: '7. BLOQUEIOS DE TRANSFERÊNCIA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Transferências serão bloqueadas se:</p>
          <ul className="space-y-2 text-[#6B7280]/70 list-disc list-inside">
            <li>O domínio foi registrado ou transferido há menos de 60 dias</li>
            <li>Existe uma disputa UDRP (Uniform Domain Resolution Policy)</li>
            <li>O domínio está sob investigação por fraude</li>
            <li>Há pagamentos pendentes</li>
            <li>O domínio está em processo de recuperação</li>
          </ul>
        </div>
      )
    },
    {
      title: '8. TRANSFERÊNCIA ENTRE CONTAS',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Para transferir domínio entre contas da Global Digital Identity:</p>
          <ul className="space-y-2 text-[#6B7280]/70 list-disc list-inside">
            <li>Processo mais rápido (geralmente 24-48 horas)</li>
            <li>Requer aprovação de ambas as partes</li>
            <li>Sem custo adicional</li>
            <li>Não adiciona tempo ao registro</li>
          </ul>
        </div>
      )
    },
    {
      title: '9. PROTEÇÃO DURANTE TRANSFERÊNCIA',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>Durante o processo de transferência:</p>
          <ul className="space-y-2 text-[#6B7280]/70 list-disc list-inside">
            <li>O domínio permanece ativo e funcional</li>
            <li>Configurações DNS são mantidas</li>
            <li>Emails de confirmação são enviados para segurança</li>
            <li>Você pode cancelar a qualquer momento</li>
          </ul>
        </div>
      )
    },
    {
      title: '10. SUPORTE',
      content: (
        <div className="text-[#6B7280]/80 space-y-4">
          <p>
            Para assistência com transferências de domínio:<br />
            Email: contact@com.rich<br />
            Nossa equipe está disponível 24/7 para ajudar com o processo de transferência.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#F5F5F5] overflow-hidden">
      <div className="relative pt-32 pb-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-sm">
              <ArrowRightLeft className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">
              Política de Transferência de Domínio
            </h1>
            <p className="text-xl text-[#6B7280]/70 mb-4">.com.rich</p>
            <div className="inline-flex items-center gap-2 text-[#6B7280]/80">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Última atualização: 21 de outubro de 2025</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
            <div className="relative bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-[#3B82F6] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-black mb-2">Global Digital Identity LTD</h2>
                  <p className="text-[#6B7280]/80 leading-relaxed mb-2">
                    Empresa registrada na Inglaterra e País de Gales sob o número <strong>Company No. 16339013</strong>
                  </p>
                  <p className="text-[#6B7280]/70 text-sm">
                    71–75 Shelton Street, Covent Garden, Londres, WC2H 9JQ, Reino Unido
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="relative bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-black mb-4">{section.title}</h2>
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default DomainTransferPolicy;
