import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PhoneInput from './PhoneInput';
import { RegisterForm } from '../types';
import * as yup from 'yup';

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de email inválido'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha muito longa')
    .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'As senhas não coincidem'),
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
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .matches(/^[0-9]*$/, 'Telefone inválido')
    .min(8, 'Telefone muito curto')
    .max(15, 'Telefone muito longo'),
  countryCode: yup
    .string()
    .required('País é obrigatório'),
  phoneCountryPrefix: yup
    .string()
    .required('Prefixo do país é obrigatório'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Você deve aceitar os termos de uso'),
});

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: 'BR',
    phoneCountryPrefix: '+55',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (phone: string, countryCode: string, prefix: string) => {
    setFormData(prev => ({
      ...prev,
      phone,
      countryCode,
      phoneCountryPrefix: prefix
    }));
    if (validationErrors.phone) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const strengthLabels = ['Muito Fraca', 'Fraca', 'Média', 'Forte', 'Muito Forte'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    try {
      await registerSchema.validate(formData, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
        setValidationErrors(errors);
        return;
      }
    }

    setLoading(true);

    try {
      const fullPhone = `${formData.phoneCountryPrefix}${formData.phone}`;

      await register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        phone: fullPhone,
        countryCode: formData.countryCode
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          >
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                  Criar Nova Conta
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Sua identidade digital global começa aqui
                </p>
              </div>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">Conta criada com sucesso!</h3>
                  <p className="text-gray-600">Redirecionando...</p>
                </motion.div>
              ) : (
                <>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-black mb-1">Nome</label>
                        <input
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                            validationErrors.firstName
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:ring-black focus:border-black'
                          }`}
                          placeholder="João"
                        />
                        {validationErrors.firstName && (
                          <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-black mb-1">Sobrenome</label>
                        <input
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                            validationErrors.lastName
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:ring-black focus:border-black'
                          }`}
                          placeholder="Silva"
                        />
                        {validationErrors.lastName && (
                          <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">Email</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 bg-gray-50 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                            validationErrors.email
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:ring-black focus:border-black'
                          }`}
                          placeholder="seu@email.com"
                        />
                      </div>
                      {validationErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">Telefone</label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        error={validationErrors.phone}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">Senha</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-2 bg-gray-50 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                            validationErrors.password
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:ring-black focus:border-black'
                          }`}
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
                      )}
                      {formData.password && !validationErrors.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all ${
                                  i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          {passwordStrength > 0 && (
                            <p className="text-xs text-gray-600">
                              Força: {strengthLabels[passwordStrength - 1]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-1">Confirmar Senha</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-2 bg-gray-50 border rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm ${
                            validationErrors.confirmPassword
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:ring-black focus:border-black'
                          }`}
                          placeholder="Repita sua senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && !validationErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          As senhas coincidem
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        required
                      />
                      <label className="text-xs text-gray-600">
                        Aceito os{' '}
                        <a href="/termos" target="_blank" className="text-black hover:underline font-medium">
                          Termos de Uso
                        </a>{' '}
                        e a{' '}
                        <a href="/privacidade" target="_blank" className="text-black hover:underline font-medium">
                          Política de Privacidade
                        </a>
                      </label>
                    </div>
                    {validationErrors.acceptTerms && (
                      <p className="text-xs text-red-600">{validationErrors.acceptTerms}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Criando conta...</span>
                        </>
                      ) : (
                        <>
                          <User className="w-5 h-5" />
                          <span>Criar Conta</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
