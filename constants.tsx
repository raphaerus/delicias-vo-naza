
import { Product } from './types';

// ==========================================
// ⚙️ CONFIGURAÇÕES GERAIS
// ==========================================

export const LOGO_URL = "https://i.postimg.cc/d3S35SLS/IMG-20181214-165723-415.jpg";
export const WHATSAPP_NUMBER = '5596981000722';
export const ADDRESS_DISPLAY = "Av. Manoel Pacífico de Cantuário, 125, Pacoval";

// 🕒 REGRAS DE FUNCIONAMENTO
export const OPENING_HOURS = {
  open: "12:00",
  close: "21:00",
  days: "Segunda a Domingo"
};

// 🔴 INTERRUPTOR DE SEGURANÇA (true = Aberto / false = Fechado Manualmente)
export const IS_KITCHEN_OPEN_MANUAL = true;

// 🛵 STATUS DA ENTREGA (true = Fazemos entrega / false = Apenas retirada)
export const IS_DELIVERY_ENABLED = false;

export const DELIVERY_FEE = 5.00;

const IMG_PADRAO = "https://i.postimg.cc/66CMDJc5/20260125-181301.jpg";

// ==========================================
// 🥐 CARDÁPIO E PREÇOS
// ==========================================
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Frango da Vovó',
    description: 'Frango desfiado bem temperadinho com o creme secreto da Vó Naza.',
    price: 7.00,
    image: IMG_PADRAO
  },
  {
    id: '2',
    name: 'Camarão Especial',
    description: 'Camarões selecionados mergulhados no molho de tomate caseiro.',
    price: 8.00,
    image: IMG_PADRAO
  },
  {
    id: '3',
    name: 'Palmito Macio',
    description: 'Palmito real em creme suave e massa que derrete na boca.',
    price: 8.00,
    image: IMG_PADRAO
  }
];
