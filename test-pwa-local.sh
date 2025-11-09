#!/bin/bash

echo "🔍 VALIDAÇÃO LOCAL DO BUILD PWA"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Teste 1: manifest.json
if [ -f "dist/manifest.json" ]; then
    SIZE=$(stat -f%z "dist/manifest.json" 2>/dev/null || stat -c%s "dist/manifest.json" 2>/dev/null)
    echo -e "${GREEN}✅ manifest.json existe${NC} ($SIZE bytes)"
    PASS=$((PASS+1))
    
    # Validar JSON
    if python3 -c "import json; json.load(open('dist/manifest.json'))" 2>/dev/null; then
        echo -e "${GREEN}   └─ JSON válido${NC}"
    else
        echo -e "${RED}   └─ JSON INVÁLIDO${NC}"
        FAIL=$((FAIL+1))
    fi
else
    echo -e "${RED}❌ manifest.json NÃO EXISTE${NC}"
    FAIL=$((FAIL+1))
fi

# Teste 2: sw.js
if [ -f "dist/sw.js" ]; then
    SIZE=$(stat -f%z "dist/sw.js" 2>/dev/null || stat -c%s "dist/sw.js" 2>/dev/null)
    echo -e "${GREEN}✅ sw.js existe${NC} ($SIZE bytes)"
    PASS=$((PASS+1))
    
    # Verificar se contém código válido
    if grep -q "CACHE_NAME" "dist/sw.js"; then
        echo -e "${GREEN}   └─ Código válido detectado${NC}"
    else
        echo -e "${RED}   └─ Código suspeito${NC}"
    fi
else
    echo -e "${RED}❌ sw.js NÃO EXISTE${NC}"
    FAIL=$((FAIL+1))
fi

# Teste 3: Ícones
if [ -d "dist/icons" ]; then
    ICON_COUNT=$(ls dist/icons/*.png 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ icons/ existe${NC} ($ICON_COUNT arquivos)"
    PASS=$((PASS+1))
    
    # Verificar ícones obrigatórios
    if [ -f "dist/icons/icon-192x192.png" ]; then
        echo -e "${GREEN}   ├─ icon-192x192.png OK${NC}"
    else
        echo -e "${RED}   ├─ icon-192x192.png FALTANDO${NC}"
        FAIL=$((FAIL+1))
    fi
    
    if [ -f "dist/icons/icon-512x512.png" ]; then
        echo -e "${GREEN}   └─ icon-512x512.png OK${NC}"
    else
        echo -e "${RED}   └─ icon-512x512.png FALTANDO${NC}"
        FAIL=$((FAIL+1))
    fi
else
    echo -e "${RED}❌ icons/ NÃO EXISTE${NC}"
    FAIL=$((FAIL+1))
fi

# Teste 4: index.html
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ index.html existe${NC}"
    PASS=$((PASS+1))
    
    # Verificar links para manifest e SW
    if grep -q 'manifest.json' "dist/index.html"; then
        echo -e "${GREEN}   ├─ Link para manifest.json encontrado${NC}"
    else
        echo -e "${YELLOW}   ├─ Link para manifest.json NÃO encontrado (pode ser adicionado via React)${NC}"
    fi
    
    if grep -q 'sw.js' "dist/index.html"; then
        echo -e "${GREEN}   └─ Registro de SW encontrado${NC}"
    else
        echo -e "${YELLOW}   └─ Registro de SW via código React${NC}"
    fi
else
    echo -e "${RED}❌ index.html NÃO EXISTE${NC}"
    FAIL=$((FAIL+1))
fi

echo ""
echo "================================"
echo -e "Resultado: ${GREEN}$PASS passou${NC} | ${RED}$FAIL falhou${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 BUILD PRONTO PARA DEPLOY!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Faça upload de TODA a pasta dist/ para https://com.rich"
    echo "2. Teste as URLs:"
    echo "   - https://com.rich/manifest.json"
    echo "   - https://com.rich/sw.js"
    echo "   - https://com.rich/icons/icon-192x192.png"
    echo "3. Verifique no Chrome DevTools (Application > Manifest/SW)"
    echo "4. Teste no Android/Chrome"
    exit 0
else
    echo -e "${RED}⚠️  CORRIJA OS ERROS ANTES DO DEPLOY${NC}"
    exit 1
fi
