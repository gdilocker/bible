const fs = require('fs');
const path = require('path');

// SVG do ícone do Rich Club (diamante dourado)
const createIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B8941E;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#000000"/>
  <path d="M${size/2} ${size*0.25} L${size*0.75} ${size/2} L${size/2} ${size*0.75} L${size*0.25} ${size/2} Z"
        fill="url(#goldGradient)"
        stroke="#FFD700"
        stroke-width="${Math.max(2, size/100)}"/>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = createIcon(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);

  // Para desenvolvimento, salvar como SVG temporariamente
  fs.writeFileSync(filename.replace('.png', '.svg'), svg);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

// Criar apple-touch-icon
const appleTouchIcon = createIcon(180);
fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png.svg'), appleTouchIcon);
console.log('✓ Created apple-touch-icon.svg');

console.log('\n⚠️  SVG files created. For production, convert to PNG using:');
console.log('   npm install -g svg2png-cli');
console.log('   svg2png public/icons/*.svg');
