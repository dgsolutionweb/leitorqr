# Leitor de Números de Código de Barras

Um aplicativo web desenvolvido em Next.js especializado em capturar os números dos códigos de barras através da câmera do smartphone.

## Funcionalidades

- 📱 **Scanner Híbrido**: Combina leitura de código de barras + OCR para máxima precisão
- 🔢 **Detecção Automática**: Detecta automaticamente os números dos códigos de barras
- 📋 **Lista de Números**: Mantém uma lista organizada de todos os números capturados
- 📄 **Copiar Individual**: Copie qualquer número específico para a área de transferência
- 📄 **Copiar Todos**: Copie todos os números de uma vez
- 🗑️ **Gerenciamento**: Remova números individuais ou limpe toda a lista

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **QuaggaJS** - Leitura de códigos de barras
- **Tesseract.js** - OCR para reconhecimento de números

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## Como Usar

### Scanner de Números
1. Clique no botão "📱 Iniciar Scanner"
2. Permita o acesso à câmera quando solicitado
3. Aponte a câmera para o código de barras
4. Alinhe o código dentro da área vermelha destacada
5. Os números serão automaticamente detectados via:
   - **Código de Barras**: Leitura direta do código
   - **OCR**: Reconhecimento dos números impressos
6. Use "📸 Capturar Manualmente" se necessário

### Gerenciar Números
- **Copiar um número**: Clique no botão "Copiar" ao lado do número desejado
- **Copiar todos**: Clique em "Copiar Todos" no topo da lista
- **Remover um número**: Clique no ícone da lixeira ao lado do número
- **Limpar tudo**: Clique em "Limpar Tudo" no topo da lista

## Requisitos

- Navegador moderno com suporte a:
  - MediaDevices API (acesso à câmera)
  - Clipboard API (copiar para área de transferência)
  - WebRTC
- Conexão HTTPS (necessária para acesso à câmera em produção)

## Compatibilidade

- ✅ Chrome/Chromium (Android/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Desktop)

## Notas Importantes

- O acesso à câmera requer HTTPS em produção
- **Iluminação**: Mantenha o código de barras bem iluminado
- **Estabilidade**: Evite tremores na câmera durante a captura
- **Contraste**: Códigos com bom contraste são detectados mais facilmente
- **Reflexos**: Evite reflexos na superfície do código
- A vibração está habilitada em dispositivos compatíveis quando um número é detectado
- O app combina duas tecnologias para máxima precisão na detecção

## Build para Produção

```bash
npm run build
npm start
```