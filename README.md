
# 🥐 Delícias da Vó Naza - Delivery

Um aplicativo de delivery artesanal desenvolvido para a **Vó Naza**, focado em facilidade de uso, estética acolhedora e integração direta com WhatsApp.

## ✨ Funcionalidades

- **Cardápio Interativo**: Visualização de produtos com fotos e descrições.
- **Carrinho de Compras**: Gestão dinâmica de itens e quantidades.
- **Checkout Flexível**: Suporta retirada no local ou entrega (se habilitada).
- **Inteligência de Horários**: O app fecha automaticamente fora do horário comercial.
- **Netinho Virtual (IA)**: Assistente integrado com Google Gemini para tirar dúvidas rápidas de forma sucinta.

---

## 🛠️ Manual de Configurações (Como Personalizar)

Quase tudo no app pode ser alterado sem mexer na lógica de programação. Abra o arquivo **`constants.tsx`** para ajustar:

### 1. Dados Básicos e Contato
*   **`WHATSAPP_NUMBER`**: O número que receberá os pedidos. Use o formato `55DDD999999999`.
*   **`LOGO_URL`**: Link da imagem da logo que aparece no topo e no chat da IA.
*   **`ADDRESS_DISPLAY`**: O endereço da sua loja que aparece no checkout e que a IA informa aos clientes.

### 2. Regras de Funcionamento (Horários e Status)
*   **`OPENING_HOURS`**: 
    *   `open`: Horário de abertura (ex: `"14:00"`).
    *   `close`: Horário de fechamento (ex: `"21:00"`).
*   **`IS_KITCHEN_OPEN_MANUAL`**: Mude para `false` se quiser fechar a loja imediatamente (ex: feriados), independente do horário.
*   **`IS_DELIVERY_ENABLED`**: Mude para `false` se não estiver fazendo entregas no dia. O app esconderá a opção de entrega.
*   **`DELIVERY_FEE`**: Valor cobrado pela entrega (R$).

### 3. Cardápio e Preços
*   **`PRODUCTS`**: Uma lista de objetos. Para cada produto você pode mudar:
    *   `name`: Nome da empada.
    *   `price`: Preço (use ponto para decimais, ex: `8.50`).
    *   `description`: O texto explicativo do sabor.

---

## 🤖 Netinho Virtual (Assistente de IA)

O assistente foi treinado para ser **sucinto** e carinhoso. Ele sabe automaticamente se a loja está aberta ou fechada com base nas suas configurações em `constants.tsx`.

Se quiser mudar as regras do que ele fala, procure a função `handleAiChat` no arquivo `App.tsx` e altere o texto dentro da variável `prompt`.

---

## 🚀 Publicando na Vercel

1. **Suba para o GitHub**: Certifique-se de que todos os arquivos estão no seu repositório.
2. **Importe no Vercel**: Vá em [vercel.com/new](https://vercel.com/new).
3. **Environment Variables**: Adicione a variável `API_KEY` com sua chave do Google Gemini.
4. **Deploy**: Pronto! O site estará no ar.

---
*Feito com carinho para a melhor vovó do mundo!* 👵❤️
