
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available?: boolean;
  category?: string;
}

export interface StoreSettings {
  id: number;
  is_open_manual: boolean;
  opening_time: string;
  closing_time: string;
  delivery_fee: number;
  allows_delivery: boolean;
  whatsapp_number: string;
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
  deviceId?: string;
}
