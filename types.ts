
// Updated Flavor type to reflect the specific names used in the product catalog and resolve type errors in constants.tsx
export type Flavor = 'Frango da Vovó' | 'Camarão Especial' | 'Palmito Macio';

export interface Product {
  id: string;
  name: Flavor;
  description: string;
  price: number;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserData {
  name: string;
  phone: string;
  address: string;
  zipCode: string;
  neighborhood: string;
  number: string;
  complement?: string;
}

export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  customer: UserData;
  paymentMethod: PaymentMethod;
  total: number;
  deliveryMode: 'pickup' | 'delivery';
}