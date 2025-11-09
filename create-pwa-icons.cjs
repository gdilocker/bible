const fs = require('fs');
const path = require('path');

// PNG mínimo válido 1x1 px transparente (base64)
const minPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Criar  PNG básico funcional para cada tamanho
sizes.forEach(size => {
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, minPNG);
  console.log(`✓ Created icon-${size}x${size}.png`);
});

// Apple touch icon
fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png'), minPNG);
console.log('✓ Created apple-touch-icon.png');

// Screenshot placeholder
fs.writeFileSync(path.join(iconsDir, 'screenshot-mobile.png'), minPNG);
console.log('✓ Created screenshot-mobile.png');

console.log('\n✅ PWA icons created successfully!');
console.log('⚠️  These are minimal placeholders. Replace with actual branded PNG icons for production.');
