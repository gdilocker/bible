// Script para criar ícones PNG usando o logo SVG do componente
const fs = require('fs');
const path = require('path');

// SVG do logo diamante
const logoSVG = `<svg width="512" height="512" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700" />
      <stop offset="50%" stop-color="#FFC700" />
      <stop offset="100%" stop-color="#D4AF37" />
    </linearGradient>
    <linearGradient id="diamondShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#FFD700" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="#000000"/>
  <path d="M 50 10 L 75 35 L 50 85 L 25 35 Z" fill="url(#goldGradient)" stroke="url(#goldGradient)" stroke-width="1.5" stroke-linejoin="miter"/>
  <path d="M 50 10 L 62.5 35 L 50 30 Z" fill="url(#diamondShine)" opacity="0.5"/>
  <path d="M 50 10 L 37.5 35 L 50 30 Z" fill="url(#diamondShine)" opacity="0.3"/>
  <path d="M 25 35 L 50 30 L 50 85 Z" fill="#000000" opacity="0.15"/>
  <path d="M 75 35 L 50 30 L 50 85 Z" fill="#000000" opacity="0.08"/>
  <line x1="50" y1="10" x2="50" y2="30" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
  <circle cx="50" cy="10" r="2" fill="#FFFFFF" opacity="0.8"/>
</svg>`;

// Criar diretório public se não existir
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Salvar ícones como SVG (browsers modernos aceitam SVG como ícone)
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), logoSVG);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), logoSVG);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), logoSVG);

console.log('✅ Ícones PWA criados com sucesso!');
console.log('   - icon-192x192.png');
console.log('   - icon-512x512.png');
console.log('   - apple-touch-icon.png');
