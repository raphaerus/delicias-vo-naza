
import { Product } from './types';

// ==========================================
// ⚙️ CONFIGURAÇÕES GERAIS
// ==========================================

// Link da logo (Ex: Imgur, Postimages, etc)
export const LOGO_URL = "https://i.postimg.cc/d3S35SLS/IMG-20181214-165723-415.jpg";

// WhatsApp que receberá os pedidos (DDI + DDD + Número)
// Ex: 55 (Brasil) + 96 (Macapá) + Número
export const WHATSAPP_NUMBER = '5596981000722';

// Taxa de entrega fixa (R$) - Aparece quando o cliente escolhe 'Entrega'
export const DELIVERY_FEE = 5.00;

// Imagem padrão usada nos produtos (caso não queira uma foto para cada)
const IMG_PADRAO = "https://i.postimg.cc/66CMDJc5/20260125-181301.jpg";

// ==========================================
// 🥐 CARDÁPIO E PREÇOS
// ==========================================
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Frango da Vovó',
    description: 'O segredo da Vó Naza: frango desfiado bem temperadinho com aquele creme que só ela sabe fazer.',
    price: 8.50, // <--- ALTERE O PREÇO AQUI
    image: IMG_PADRAO
  },
  {
    id: '2',
    name: 'Camarão Especial',
    description: 'Camarões limpos e selecionados, mergulhados no molho de tomate caseiro da vovó.',
    price: 12.00, // <--- ALTERE O PREÇO AQUI
    image: IMG_PADRAO
  },
  {
    id: '3',
    name: 'Palmito Macio',
    description: 'Pedacinhos de palmito real em um creme suave e a massa que derrete na boca.',
    price: 9.50, // <--- ALTERE O PREÇO AQUI
    image: IMG_PADRAO
  }
];
