const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function createDiamondSVG(size) {
  const center = size / 2;
  const halfWidth = size * 0.25;
  const halfHeight = size * 0.3;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <defs>
    <linearGradient id="gold-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFF200;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4AF37;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(${center}, ${center})">
    <polygon points="0,${-halfHeight} ${halfWidth},0 0,${halfHeight} ${-halfWidth},0"
             fill="url(#gold-${size})"
             stroke="#FFD700"
             stroke-width="3"
             opacity="0.95"/>
  </g>
</svg>`;
}

const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createDiamondSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✓ ${filename}`);
});

console.log('✅ Ícones criados!');
