import { Product } from './types';

// Altere este link para a URL da imagem da sua logo (Ex: Imgur, Postimages, etc)
export const LOGO_URL = "https://i.postimg.cc/d3S35SLS/IMG-20181214-165723-415.jpg";

// URL da imagem dos produtos
const IMG_PADRAO = "https://i.postimg.cc/66CMDJc5/20260125-181301.jpg";

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Frango da Vovó',
    description: 'O segredo da Vó Naza: frango desfiado bem temperadinho com aquele creme que só ela sabe fazer.',
    price: 8.50,
    image: IMG_PADRAO
  },
  {
    id: '2',
    name: 'Camarão Especial',
    description: 'Camarões limpos e selecionados, mergulhados no molho de tomate caseiro da vovó.',
    price: 12.00,
    image: IMG_PADRAO
  },
  {
    id: '3',
    name: 'Palmito Macio',
    description: 'Pedacinhos de palmito real em um creme suave e a massa que derrete na boca.',
    price: 9.50,
    image: IMG_PADRAO
  }
];

export const DELIVERY_FEE = 5.00;
export const WHATSAPP_NUMBER = '5596981000722';
