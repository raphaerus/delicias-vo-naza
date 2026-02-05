
import { supabase } from '../lib/supabase';
import { Product, StoreSettings, Order } from '../types';

export const api = {
    getProducts: async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_available', true);

        if (error) throw error;
        return data as Product[];
    },

    getStoreSettings: async () => {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single();

        if (error) throw error;
        return data as StoreSettings;
    },

    createOrder: async (order: Order) => {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                id: order.id,
                customer_name: order.customer.name,
                customer_phone: order.customer.phone,
                delivery_mode: order.deliveryMode,
                payment_method: order.paymentMethod,
                total: order.total,
                items: order.items,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
