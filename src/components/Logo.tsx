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
          <stop offset="50%" stopColor="#FFC700" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFD700" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Hexágono luxuoso - forma geométrica premium */}
      <path
        d="M 50 10 L 80 30 L 80 70 L 50 90 L 20 70 L 20 30 Z"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hexágono interno menor - profundidade */}
      <path
        d="M 50 25 L 70 38 L 70 62 L 50 75 L 30 62 L 30 38 Z"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Estrela central de 4 pontas - elegante */}
      <path
        d="M 50 35 L 53 47 L 65 50 L 53 53 L 50 65 L 47 53 L 35 50 L 47 47 Z"
        fill="url(#goldGradient)"
        opacity="0.9"
      />

      {/* Brilho sutil no topo - efeito luxo */}
      <rect
        x="35"
        y="15"
        width="30"
        height="2"
        fill="url(#shineGradient)"
        rx="1"
      />
    </svg>
  );
}
