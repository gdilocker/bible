import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * HeroSection - Componente padronizado para todas as páginas hero
 *
 * Regras de uso:
 * • min-h-screen flex items-center sempre na <section>
 * • pt-32 sm:pt-36 lg:pt-40 sempre no container interno
 * • Nunca usar py-* no container do hero (só pb-* se precisar espaço abaixo)
 * • Nada de mt-[-x] ou translate-y-* no <h1>
 */
export default function HeroSection({ children, className = "" }: Props) {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className={`w-full pt-32 sm:pt-36 lg:pt-40 pb-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </section>
  );
}
