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
      {/* Coroa dourada com efeito de brilho */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941E" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Base da coroa */}
      <path
        d="M 20 70 L 30 40 L 50 55 L 70 40 L 80 70 Z"
        fill="url(#goldGradient)"
        stroke="#FFD700"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* Pontas da coroa */}
      <circle cx="30" cy="35" r="5" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="1.5" />
      <circle cx="50" cy="25" r="6" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="1.5" />
      <circle cx="70" cy="35" r="5" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="1.5" />

      {/* Jóias na coroa */}
      <circle cx="35" cy="55" r="3" fill="#FF6B6B" opacity="0.8" />
      <circle cx="50" cy="50" r="3.5" fill="#4ECDC4" opacity="0.8" />
      <circle cx="65" cy="55" r="3" fill="#95E1D3" opacity="0.8" />

      {/* Borda inferior */}
      <rect x="20" y="70" width="60" height="8" fill="url(#goldGradient)" stroke="#FFD700" strokeWidth="1.5" rx="2" />
    </svg>
  );
}
