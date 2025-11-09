import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>

      {/* Círculo externo clean */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#goldGradient)"
        strokeWidth="3"
        fill="none"
      />

      {/* Letra R estilizada minimalista */}
      <text
        x="50"
        y="70"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="60"
        fontWeight="700"
        fill="url(#goldGradient)"
        textAnchor="middle"
        letterSpacing="-2"
      >
        R
      </text>

      {/* Detalhe premium - pequeno diamante no topo */}
      <path
        d="M 50 15 L 55 20 L 50 25 L 45 20 Z"
        fill="url(#goldGradient)"
      />
    </svg>
  );
}
