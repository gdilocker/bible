#!/bin/bash
# Gerar PNGs a partir de SVG usando ImageMagick ou rsvg-convert

echo "🎨 Gerando ícones PNG..."

# Verificar se rsvg-convert está disponível
if command -v rsvg-convert &> /dev/null; then
    echo "✓ Usando rsvg-convert"
    rsvg-convert -w 192 -h 192 public/icons/icon-192x192.svg -o public/icons/icon-192x192.png
    rsvg-convert -w 512 -h 512 public/icons/icon-512x512.svg -o public/icons/icon-512x512.png
    echo "✅ PNGs gerados com rsvg-convert"
elif command -v convert &> /dev/null; then
    echo "✓ Usando ImageMagick"
    convert -background none -size 192x192 public/icons/icon-192x192.svg public/icons/icon-192x192.png
    convert -background none -size 512x512 public/icons/icon-512x512.svg public/icons/icon-512x512.png
    echo "✅ PNGs gerados com ImageMagick"
else
    echo "❌ Nenhuma ferramenta de conversão encontrada"
    echo "📝 Criando PNGs manualmente via Node.js..."
fi

ls -lh public/icons/*.png 2>/dev/null || echo "⚠️  PNGs não criados ainda"
