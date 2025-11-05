import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ContactInfo } from '../types';
import { supabase } from '../lib/supabase';
import * as yup from 'yup';

const contactSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome muito curto')
    .max(50, 'Nome muito longo')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  lastName: yup
    .string()
    .required('Sobrenome é obrigatório')
    .min(2, 'Sobrenome muito curto')
    .max(50, 'Sobrenome muito longo')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^[0-9\s+()-]+$/, 'Telefone inválido')
    .min(8, 'Telefone muito curto'),
  address1: yup
    .string()
    .required('Endereço é obrigatório')
    .min(5, 'Endereço muito curto')
    .max(200, 'Endereço muito longo'),
  city: yup
    .string()
    .required('Cidade é obrigatória')
    .min(2, 'Cidade muito curta')
    .max(100, 'Cidade muito longa'),
  state: yup
    .string()
    .required('Estado é obrigatório')
    .min(2, 'Estado inválido')
    .max(50, 'Estado muito longo'),
  postalCode: yup
    .string()
    .required('CEP é obrigatório')
    .matches(/^[0-9-\s]+$/, 'CEP inválido'),
  country: yup
    .string()
    .required('País é obrigatório')
    .length(2, 'Código de país inválido'),
});

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Checkout: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const domainFromState = location.state?.domain || '';
  const fromMarketplace = location.state?.fromMarketplace || false;
  const isPremiumDomain = location.state?.isPremiumDomain || false;
  const domain = domainFromState || query.get('domain') || '';
  const planParam = query.get('plan') || 'basic';

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(planParam);
  const [planPrice, setPlanPrice] = useState<number>(25.00);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [domainPrice, setDomainPrice] = useState<number>(25.00);
  const [loadingPrice, setLoadingPrice] = useState<boolean>(true);
  const [domainType, setDomainType] = useState<'personal' | 'business'>('personal');
  const [existingDomains, setExistingDomains] = useState<Array<{domain_type: string}>>([]);

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'BR'
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!domain) {
      navigate('/');
      return;
    }

    // Buscar o preço do domínio
    const fetchDomainPrice = async () => {
      try {
        setLoadingPrice(true);

        if (isPremiumDomain) {
          // Buscar preço de domínio premium
          const { data: premiumDomain, error } = await supabase
            .from('premium_domains')
            .select('price_usd')
            .eq('fqdn', domain)
            .maybeSingle();

          if (error) {
            console.error('Error fetching premium domain price:', error);
            setDomainPrice(25000.00);
          } else if (premiumDomain) {
            setDomainPrice(premiumDomain.price_usd);
          } else {
            setDomainPrice(25000.00);
          }
        } else {
          // Extrair o nome do domínio sem o .email
          const domainName = domain.replace(/\.email$/i, '');

          // Buscar o preço na tabela domain_suggestions
          const { data: suggestion, error } = await supabase
            .from('domain_suggestions')
            .select('price_override')
            .eq('domain_name', domainName)
            .maybeSingle();

          if (error) {
            console.error('Error fetching domain price:', error);
            setDomainPrice(25.00);
          } else if (suggestion && suggestion.price_override) {
            setDomainPrice(parseFloat(suggestion.price_override));
          } else {
            setDomainPrice(25.00);
          }
        }
      } catch (error) {
        console.error('Error fetching domain price:', error);
        setDomainPrice(isPremiumDomain ? 25000.00 : 25.00);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchDomainPrice();
  }, [domain, navigate]);

  useEffect(() => {
    const fetchUserDomains = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: customerData } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (customerData) {
          const { data: domainsData } = await supabase
            .from('domains')
            .select('domain_type')
            .eq('customer_id', customerData.id);

          setExistingDomains(domainsData || []);
        }
      } catch (error) {
        console.error('Error fetching user domains:', error);
      }
    };

    fetchUserDomains();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectPlan = async (planId: string, planCode: string) => {
    setSelectedPlanId(planId);
    setSelectedPlanCode(planCode);

    const { data: plan } = await (window as any).supabase
      .from('pricing_plans')
      .select('price_cents')
      .eq('id', planId)
      .single();

    if (plan) {
      const monthly = (plan.price_cents || 0) / 100;
      setMonthlyPrice(monthly);
      // Total inicial: domínio anual + primeiro mês do plano
      setPlanPrice(domainPrice + monthly);
    }
  };

  const handlePayPalPayment = async () => {
    setError('');
    setValidationErrors({});

    if (!acceptTerms) {
      setError('Você deve aceitar os termos de uso para continuar');
      return;
    }

    if (!selectedPlanId) {
      setError('Por favor, selecione um plano');
      return;
    }

    try {
      await contactSchema.validate(contactInfo, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
        setValidationErrors(errors);
        setError('Por favor, corrija os erros no formulário');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await (window as any).supabase.auth.getSession();

      if (!session) {
        throw new Error('Você precisa estar logado para continuar');
      }

      // Revalidate domain price before payment
      const priceCheckResponse = await fetch(`${supabaseUrl}/functions/v1/domains/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check',
          fqdn: domain
        })
      });

      if (!priceCheckResponse.ok) {
        throw new Error('Não foi possível validar o preço do domínio');
      }

      const priceCheck = await priceCheckResponse.json();

      if (!priceCheck.available) {
        throw new Error('Este domínio não está mais disponível');
      }

      // Check if price changed significantly (more than $0.50)
      const currentDomainPrice = priceCheck.pricing?.salePriceUSD || parseFloat(priceCheck.price);
      if (Math.abs(currentDomainPrice - domainPrice) > 0.50) {
        const newTotal = currentDomainPrice + monthlyPrice;
        const message = `Domain price has been updated!\n\nPrevious price: $${domainPrice.toFixed(2)}\nNew price: $${currentDomainPrice.toFixed(2)}\nTotal: $${newTotal.toFixed(2)}\n\nPlease review your order.`;
        setError(message);
        setIsProcessing(false);
        return;
      }

      // Check if mock payment mode is enabled
      const useMockPayment = import.meta.env.VITE_USE_PAYMENT_MOCK === 'true';
      const paymentEndpoint = useMockPayment
        ? 'mock-payment-create'
        : 'paypal-create-order';

      console.log(`[Checkout] Using ${useMockPayment ? 'MOCK' : 'REAL'} payment mode`);

      const response = await fetch(`${supabaseUrl}/functions/v1/${paymentEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          domain,
          price: planPrice,
          planId: selectedPlanId,
          planCode: selectedPlanCode,
          contactInfo,
          domainType,
          return_url: `${window.location.origin}/paypal/return`,
          cancel_url: `${window.location.origin}/paypal/cancel`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        throw new Error('URL de checkout não recebida');
      }

    } catch (err) {
      console.error('Erro no PayPal:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!domain) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-slate-900 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar à pesquisa
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Finalizar Registro
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Informações de Registro
            </h2>

            <div className="space-y-6">
              {/* Domain Type Selection */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-blue-100">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Tipo de Domínio *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDomainType('personal')}
                    disabled={existingDomains.some(d => d.domain_type === 'personal')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      domainType === 'personal'
                        ? 'border-slate-500 bg-slate-100 shadow-md'
                        : existingDomains.some(d => d.domain_type === 'personal')
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        : 'border-gray-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Pessoal</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Para uso individual
                      </div>
                      {existingDomains.some(d => d.domain_type === 'personal') && (
                        <div className="text-xs text-amber-600 mt-2 font-medium">
                          Você já possui um domínio pessoal
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomainType('business')}
                    disabled={existingDomains.some(d => d.domain_type === 'business')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      domainType === 'business'
                        ? 'border-slate-500 bg-slate-100 shadow-md'
                        : existingDomains.some(d => d.domain_type === 'business')
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        : 'border-gray-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold text-gray-900">Empresarial</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Para sua empresa
                      </div>
                      {existingDomains.some(d => d.domain_type === 'business') && (
                        <div className="text-xs text-amber-600 mt-2 font-medium">
                          Você já possui um domínio empresarial
                        </div>
                      )}
                    </div>
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-3">
                  Você pode registrar até 2 domínios: um pessoal e um empresarial
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={contactInfo.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={contactInfo.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço *
                </label>
                <input
                  type="text"
                  name="address1"
                  value={contactInfo.address1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={contactInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={contactInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <select
                    name="country"
                    value={contactInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="BR">Brasil</option>
                    <option value="US">Estados Unidos</option>
                    <option value="GB">Reino Unido</option>
                    <option value="PT">Portugal</option>
                    <option value="ES">Espanha</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-slate-900 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                  required
                />
                <label className="text-sm text-gray-700">
                  Eu concordo com os{' '}
                  <Link to="/termos" className="text-slate-900 hover:text-slate-900 underline">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/politica" className="text-slate-900 hover:text-slate-900 underline">
                    Política de Privacidade
                  </Link>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resumo do Pedido
            </h2>

            <div className="space-y-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{domain}</p>
                    <p className="text-sm text-gray-600">Registro por 1 ano</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">${domainPrice.toFixed(2)}</p>
                </div>

                {monthlyPrice > 0 && (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Plano {selectedPlanCode}</p>
                      <p className="text-sm text-gray-600">Primeiro mês</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${monthlyPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-green-600">
                <p>Proteção WHOIS</p>
                <p className="font-medium">Grátis</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-gray-900">Total</p>
                  <p className="text-2xl font-bold text-slate-900">${planPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Inclui extensão por 1 ano e proteção WHOIS gratuita
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Método de Pagamento
              </h3>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-slate-900 text-sm">
                  <strong>Pagamento seguro:</strong> Processado com segurança pelo PayPal
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-700 font-medium">Erro no pagamento</p>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal Payment */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment"
                    defaultChecked
                    className="w-4 h-4 text-slate-900"
                  />
                  <div className="w-5 h-5 bg-slate-700 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <label htmlFor="paypal" className="font-medium text-gray-900">
                    PayPal
                  </label>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Pague com sua conta PayPal
                </p>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handlePayPalPayment}
                  disabled={isProcessing || !acceptTerms}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                        <span className="text-slate-900 text-xs font-bold">P</span>
                      </div>
                      <span>Pagar com PayPal</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4">
                <Shield className="w-4 h-4" />
                <span>Pagamento 100% seguro e criptografado</span>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Após a confirmação do pagamento via PayPal, registramos o domínio automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;