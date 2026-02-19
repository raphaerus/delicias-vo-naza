import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Settings, ShoppingBag, Loader2, CheckCircle, XCircle, Clock, Save, ToggleLeft, ToggleRight, Plus, Edit, Trash2, X, Image as ImageIcon, Menu } from 'lucide-react';
import { LOGO_URL } from '../../constants';
import { api } from '../../services/api';
import { Order, Product, StoreSettings } from '../../types';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');

    // Data States
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); // To force re-fetch

    // Mobile Sidebar State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Product Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState<Partial<Product>>({
        name: '', description: '', price: 0, image_url: '', category: 'Empadas', is_available: true
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/admin/login');
            } else {
                fetchData();
            }
        });
    }, [navigate]);

    useEffect(() => {
        if (!loading) fetchData();
    }, [refreshKey, activeTab]);

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('realtime-orders')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple bell sound
                    audio.play().catch(e => console.log("Audio play failed", e));
                    alert("🔔 NOVO PEDIDO CHEGOU!");
                    setRefreshKey(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, []);

    const fetchData = async () => {
        try {
            if (activeTab === 'orders') {
                const data = await api.getAdminOrders();
                setOrders(data as any);
            } else if (activeTab === 'products') {
                const data = await api.getAllProducts();
                setProducts(data);
            } else if (activeTab === 'settings') {
                const data = await api.getStoreSettings();
                setSettings(data);
            }
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Deseja alterar status para ${newStatus}?`)) return;
        try {
            await api.updateOrderStatus(id, newStatus);
            setRefreshKey(p => p + 1);
        } catch (e) {
            alert("Erro ao atualizar status");
        }
    };

    const handleToggleProduct = async (product: Product) => {
        try {
            // Invert logic because getProducts only returns available? 
            // Wait, api.getProducts has .eq('is_available', true). 
            // For Admin, we need ALL products.
            // I need to update api.getProducts or create api.getAllProducts.
            // For now, let's assume getProducts returns all (I should check api.ts)
            await api.toggleProductAvailability(product.id, !product.is_available); // This property might be missing in type if not updated
            setRefreshKey(p => p + 1);
        } catch (e) {
            alert("Erro ao atualizar produto");
        }
    };

    const openProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductForm(product);
        } else {
            setEditingProduct(null);
            setProductForm({ name: '', description: '', price: 0, image_url: '', category: 'Empadas', is_available: true });
        }
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, productForm);
                alert("Produto atualizado!");
            } else {
                await api.createProduct(productForm as any);
                alert("Produto criado!");
            }
            setIsProductModalOpen(false);
            setRefreshKey(p => p + 1);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar produto.");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            await api.deleteProduct(id);
            setRefreshKey(p => p + 1);
        } catch (error) {
            alert("Erro ao excluir produto.");
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        try {
            await api.updateStoreSettings({
                is_open_manual: settings.is_open_manual,
                opening_time: settings.opening_time,
                closing_time: settings.closing_time,
                delivery_fee: settings.delivery_fee,
                allows_delivery: settings.allows_delivery
            });
            alert("Configurações salvas!");
        } catch (e) {
            alert("Erro ao salvar");
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-pink" /></div>;
    }

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <img src={LOGO_URL} className="w-8 h-8 rounded-full" alt="Logo" />
                    <h1 className="font-bold text-brand-brown">Painel Vó Naza</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand-brown">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Mobile / Desktop */}
            <aside className={`
                bg-white w-64 h-screen flex flex-col justify-between p-4 shadow-sm z-30
                fixed md:sticky top-0 left-0 transition-transform duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div>
                    <div className="hidden md:flex items-center gap-3 mb-8">
                        <img src={LOGO_URL} className="w-10 h-10 rounded-full" alt="Logo" />
                        <h1 className="font-bold text-brand-brown">Painel Vó Naza</h1>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
                            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-brand-pink text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                        >
                            <ShoppingBag size={20} /> Pedidos
                        </button>
                        <button
                            onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
                            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'products' ? 'bg-brand-pink text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                        >
                            <Package size={20} /> Produtos
                        </button>
                        <button
                            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-brand-pink text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
                        >
                            <Settings size={20} /> Configurações
                        </button>
                    </nav>
                </div>

                <button onClick={handleLogout} className="mt-auto p-3 text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3">
                    <LogOut size={20} /> Sair
                </button>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen w-full">
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-brand-brown">Pedidos Recentes</h2>
                        <div className="grid gap-4">
                            {orders.length === 0 ? <p className="text-neutral-400">Nenhum pedido ainda.</p> : orders.map((order: any) => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-peach/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{order.customer_name}</h3>
                                            <p className="text-sm text-neutral-500">{order.customer_phone}</p>
                                            <span className="text-xs bg-neutral-100 px-2 py-1 rounded mt-1 inline-block">
                                                {new Date(order.created_at).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-brand-pink">R$ {order.total.toFixed(2)}</p>
                                            <p className="text-xs uppercase font-bold text-neutral-400">{order.payment_method}</p>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 p-4 rounded-xl mb-4 text-sm space-y-1">
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between">
                                                <span>{item.quantity}x {item.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.payment_method === 'Pix' && (
                                        <div className="mb-4 text-xs bg-yellow-50 text-yellow-700 p-2 rounded border border-yellow-200">
                                            ⚠️ Verifique o comprovante do PIX no WhatsApp!
                                        </div>
                                    )}

                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm ${order.status === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        >
                                            Preparando
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'finished')}
                                            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm ${order.status === 'finished' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            Entregue/Pronto
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                            className={`py-2 px-4 rounded-xl font-bold text-sm ${order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-brand-brown">Gerenciar Produtos</h2>
                            <button
                                onClick={() => openProductModal()}
                                className="bg-brand-pink text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:brightness-110"
                            >
                                <Plus size={20} /> Novo Produto
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {products.map(product => (
                                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-brand-peach/10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16">
                                            <img src={product.image_url} className={`w-full h-full rounded-xl object-cover ${!product.is_available && 'grayscale opacity-50'}`} alt={product.name} />
                                            {!product.is_available && <div className="absolute inset-0 flex items-center justify-center"><XCircle size={20} className="text-red-500" /></div>}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-brown">{product.name}</h3>
                                            <p className="text-sm text-brand-green font-bold">R$ {product.price.toFixed(2)}</p>
                                            <span className="text-[10px] uppercase tracking-wider text-neutral-400">{product.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleProduct(product)}
                                            title={product.is_available ? "Pausar Vendas" : "Retomar Vendas"}
                                            className={`p-2 rounded-lg transition-colors ${product.is_available ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                        >
                                            {product.is_available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        </button>
                                        <button
                                            onClick={() => openProductModal(product)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Modal */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-brand-brown">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">Nome do Produto</label>
                                    <input
                                        required
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:outline-brand-pink"
                                        placeholder="Ex: Empada de Frango"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 mb-1">Preço (R$)</label>
                                        <input
                                            type="number" step="0.50" required
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                                            className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:outline-brand-pink"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 mb-1">Categoria</label>
                                        <select
                                            value={productForm.category}
                                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                            className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:outline-brand-pink"
                                        >
                                            <option>Empadas</option>
                                            <option>Bebidas</option>
                                            <option>Combos</option>
                                            <option>Sobremesas</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">Descrição</label>
                                    <textarea
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:outline-brand-pink h-20 resize-none"
                                        placeholder="Ingredientes e detalhes..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1 flex items-center gap-2">
                                        <ImageIcon size={14} /> URL da Imagem
                                    </label>
                                    <input
                                        value={productForm.image_url}
                                        onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:outline-brand-pink"
                                        placeholder="https://..."
                                    />
                                    {productForm.image_url && (
                                        <div className="mt-2 h-20 rounded-xl overflow-hidden bg-neutral-100 border text-xs flex items-center justify-center text-neutral-400">
                                            <img src={productForm.image_url} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = LOGO_URL)} />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-pink text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] mt-4"
                                >
                                    {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && settings && (
                    <div className="max-w-lg">
                        <h2 className="text-2xl font-bold mb-6">Configurações da Loja</h2>
                        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl shadow-sm space-y-6">

                            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                                <span className="font-bold text-brand-brown">Loja Aberta Manualmente?</span>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, is_open_manual: !settings.is_open_manual })}
                                    className={`w-14 h-8 rounded-full flex items-center p-1 transition-all ${settings.is_open_manual ? 'bg-green-500 justify-end' : 'bg-neutral-300 justify-start'}`}
                                >
                                    <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">Abertura</label>
                                    <input
                                        type="time"
                                        value={settings.opening_time}
                                        onChange={e => setSettings({ ...settings, opening_time: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">Fechamento</label>
                                    <input
                                        type="time"
                                        value={settings.closing_time}
                                        onChange={e => setSettings({ ...settings, closing_time: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-500 mb-1">Taxa de Entrega (R$)</label>
                                <input
                                    type="number" step="0.50"
                                    value={settings.delivery_fee}
                                    onChange={e => setSettings({ ...settings, delivery_fee: parseFloat(e.target.value) })}
                                    className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand-pink text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Salvar Alterações
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
