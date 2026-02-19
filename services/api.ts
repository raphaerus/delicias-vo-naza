
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
                status: 'pending',
                device_id: order.deviceId // New field
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getMyOrders: async (deviceId: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('device_id', deviceId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any[];
    },

    // --- ADMIN FUNCTIONS ---

    getAllProducts: async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as Product[];
    },

    createProduct: async (product: Omit<Product, 'id' | 'created_at'>) => {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateProduct: async (id: string, updates: Partial<Product>) => {
        const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    },

    deleteProduct: async (id: string) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    getAdminOrders: async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    updateOrderStatus: async (id: string, status: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    },

    toggleProductAvailability: async (id: string, isAvailable: boolean) => {
        const { error } = await supabase
            .from('products')
            .update({ is_available: isAvailable })
            .eq('id', id);
        if (error) throw error;
    },

    updateStoreSettings: async (settings: Partial<StoreSettings>) => {
        // settings tem id=1 hardcoded no banco
        const { error } = await supabase
            .from('store_settings')
            .update(settings)
            .eq('id', 1);
        if (error) throw error;
    }
};
