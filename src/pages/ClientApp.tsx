import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ShoppingBag,
    MapPin,
    MessageCircle,
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    CheckCircle,
    Store,
    Truck,
    Sparkles,
    Send,
    X,
    Clock,
    AlertCircle,
    Instagram
} from 'lucide-react';
import { LOGO_URL, ADDRESS_DISPLAY, INITIAL_STORE_SETTINGS, PIX_KEY, PIX_NAME, INSTAGRAM_URL } from '../../constants';
import { CartItem, UserData, PaymentMethod, Order, Product, StoreSettings } from '../../types';
import { api } from '../../services/api';
import { getDeviceId } from '../lib/device';
import { supabase } from '../../lib/supabase';

type View = 'menu' | 'cart' | 'checkout' | 'success' | 'orders';
type DeliveryMode = 'pickup' | 'delivery';

export default function ClientApp() {
    const [view, setView] = useState<View>('menu');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');

    // States from Backend
    const [products, setProducts] = useState<Product[]>([]);
    const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
    const [loading, setLoading] = useState(true);

    const [userData, setUserData] = useState<UserData>({
        name: '',
        phone: '',
        address: '',
        zipCode: '',
        neighborhood: '',
        number: '',
        complement: ''
    });

    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // My Orders State
    const [showMyOrders, setShowMyOrders] = useState(false);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const fetchMyOrders = async () => {
        setLoadingOrders(true);
        try {
            const deviceId = getDeviceId();
            const orders = await api.getMyOrders(deviceId);
            setMyOrders(orders || []);
        } catch (e) {
            console.error("Erro ao buscar pedidos:", e);
        } finally {
            setLoadingOrders(false);
        }
    };



    // Fetch Initial Data
    useEffect(() => {
        async function loadData() {
            try {
                const [productsData, settingsData] = await Promise.all([
                    api.getProducts(),
                    api.getStoreSettings()
                ]);
                setProducts(productsData);
                if (settingsData) setStoreSettings(settingsData);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();

        // Realtime Subscription
        const channel = supabase
            .channel('realtime-settings-client')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'store_settings' },
                (payload) => {
                    setStoreSettings(payload.new as StoreSettings);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, []);

    // Lógica para verificar se está aberto
    const isStoreOpen = useMemo(() => {
        // Se o botão "Loja Aberta Manualmente" estiver ativado, a loja está ABERTA.
        // Independente do horário. É um "Force Open".
        if (storeSettings.is_open_manual) return true;

        // Se estiver desligado, verificamos o horário (Lógica antiga: ou fecha tudo ou segue horário?)
        // O usuário disse "ligar e desligar a loja". Então:
        // Botão Ligado = ABERTA
        // Botão Desligado = FECHADA

        // Mas espere, existem campos de horário.
        // Vamos assumir o comportamento híbrido mais comum:
        // O botão é "Permitir Abertura". Se desligado, fecha tudo.
        // Se ligado, checa horário. 

        // O usuário reclamou que "não funciona". Provavelmente ele ligou o botão fora do horário
        // e esperava que abrisse.

        // VOU MUDAR PARA: Botão define TUDO.
        // Se quiser usar horário automático, precisaria de um terceiro estado ou outro boolean.
        // Como só temos `is_open_manual`, vamos tratar como "LOJA ESTÁ ABERTA?".

        return storeSettings.is_open_manual;

        /* Lógica antiga (comentada para referência)
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        // ...
        return currentTime >= openTime && currentTime <= closeTime;
        */
    }, [storeSettings]);

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages]);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
    const total = useMemo(() => subtotal + (deliveryMode === 'delivery' ? storeSettings.delivery_fee : 0), [subtotal, deliveryMode, storeSettings]);

    const addToCart = (product: Product) => {
        if (!isStoreOpen) {
            alert(`A cozinha da vovó está fechada no momento. Abrimos das ${storeSettings.opening_time} às ${storeSettings.closing_time}.`);
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

    const formatWhatsAppMessage = (order: Order) => {
        const itemsText = order.items.map(item => `• *${item.quantity}x ${item.name}*`).join('\n');

        let message = `🧀 *NOVO PEDIDO - VÓ NAZA*\n\n${order.deliveryMode === 'pickup' ? '🏪 RETIRADA' : '🛵 ENTREGA'}\n\n*Itens:*\n${itemsText}\n\n*Total:* R$ ${order.total.toFixed(2)}\n\n*Cliente:* ${order.customer.name}\n*Tel:* ${order.customer.phone}\n*Pagamento:* ${order.paymentMethod}`;

        if (order.paymentMethod === 'Pix') {
            message += `\n\n🔑 *CHAVE PIX:*\n${PIX_KEY}\n${PIX_NAME}\n\n_Por favor, envie o comprovante!_`;
        }

        return message.trim();
    };

    const handleFinishOrder = async () => {
        if (!isStoreOpen) {
            alert("Desculpe, a cozinha fechou enquanto você montava o carrinho.");
            return;
        }

        const order: Order = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            items: cart,
            customer: userData,
            paymentMethod,
            total,
            deliveryMode,
            deviceId: getDeviceId()
        };

        try {
            await api.createOrder(order);
        } catch (err) {
            console.error("Erro ao salvar pedido:", err);
        }

        window.open(`https://wa.me/${storeSettings.whatsapp_number}?text=${encodeURIComponent(formatWhatsAppMessage(order))}`, '_blank');
        setCart([]);
        setView('success');
    };

    const handleAiChat = async () => {
        if (!aiInput.trim() || aiLoading) return;
        const userMsg = aiInput.trim();
        setAiInput('');
        setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setAiLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("Chave de API do Gemini não encontrada");

            const prompt = `Você é o Netinho da Vó Naza. REGRAS CRÍTICAS:
1. Fale o quanto quiser. Mas não exagere.Seja CARISMÁTICO e AFETIVO. Ajude as pessoas a conhecerem as empadas da Vó Naza.
2. Status atual: A cozinha está ${isStoreOpen ? 'ABERTA' : 'FECHADA'}.Só informe isso se perguntarem diretamente.
3. Horário: ${storeSettings.opening_time} às ${storeSettings.closing_time}. Só informe isso se perguntarem diretamente.
4. Entrega: ${storeSettings.allows_delivery ? 'Fazemos entregas' : 'Apenas RETIRADA no Pacoval'}.Só informe isso se perguntarem diretamente.
5. Endereço: ${ADDRESS_DISPLAY}.Só informe isso se perguntarem diretamente.
6. Use um tom carinhoso e emojis de vó.
7. Se estiver fechado, diga que a vovó está descansando e informe o horário de volta.
8. Se perguntarem sobre o cardápio, mencione os produtos: ${products.map(p => p.name).join(', ')}.
9. Evite falar sobre assuntos fora do contexto do delivery de empadas.
10. Evite o uso de simbolos markdown como asteriscos ou underscores.
11. Não precisa informar todas as informações de uma vez. Responda conforme a dúvida do cliente.
12. valores dos produtos são: ${products.map(p => `${p.name} por R$ ${p.price.toFixed(2)}`).join(', ')}.

Pergunta: ${userMsg}`;

            // Usando REST direto. Modelo: gemini-2.0-flash (validado via script)
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                const errMsg = errData.error?.message || "Erro na API do Google";
                if (response.status === 429) {
                    throw new Error("A vovó está falando com muitas pessoas ao mesmo tempo (Limite da IA atingido). Tente daqui a pouco!");
                }
                throw new Error(errMsg);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("Nenhuma resposta gerada pela IA");

            setAiMessages(prev => [...prev, { role: 'ai', text: text }]);
        } catch (e: any) {
            console.error("AI Error:", e);
            // alert removed per user request
            const message = e.message || "Minha conexão falhou, querido. Pode repetir?";
            setAiMessages(prev => [...prev, { role: 'ai', text: message }]);
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-brand-brown animate-pulse">Carregando as delícias...</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2" onClick={() => setView('menu')}>
                    <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-full object-cover cursor-pointer" />
                    <h1 className="font-bold text-lg text-pink-600 cursor-pointer">Vó Naza</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setView('orders'); fetchMyOrders(); }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative"
                    >
                        <Clock size={24} />
                    </button>
                    <button
                        className="p-2 relative text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                        onClick={() => setView('cart')}
                    >
                        <ShoppingBag size={24} />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                {view === 'menu' && (
                    <div className="p-4 space-y-6 animate-in fade-in duration-500">
                        {/* Aviso de Fechado */}
                        {!isStoreOpen && (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-3xl flex items-center gap-4 text-red-600 shadow-sm">
                                <Clock className="shrink-0" />
                                <div className="text-xs font-medium">
                                    A cozinha está descansando! <br />
                                    <b>Horário: {storeSettings.opening_time} às {storeSettings.closing_time}</b>
                                </div>
                            </div>
                        )}

                        {/* Informações de Contato (Sempre visíveis) */}
                        <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-brand-pink" />
                                <span>{ADDRESS_DISPLAY}</span>
                            </div>
                            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-pink font-bold hover:underline">
                                <Instagram size={14} />
                                @delicias_da_vo_naza
                            </a>
                        </div>

                        {products.length > 0 && (
                            <div className="relative h-52 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-brand-peach/20">
                                <img src={products[0].image_url} className="w-full h-full object-cover" alt="Banner" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                                    <h2 className="text-white text-2xl font-bold italic">Sabor que abraça</h2>
                                    <p className="text-brand-peach text-xs">Empadas artesanais do Pacoval</p>
                                </div>
                            </div>
                        )}

                        <section className="space-y-4">
                            <h3 className="text-2xl font-bold text-brand-brown italic px-2">Nossas Delícias</h3>
                            <div className="grid gap-4">
                                {products.map(product => (
                                    <div key={product.id} className={`bg-white p-4 rounded-[2rem] flex gap-4 border border-brand-peach/10 shadow-sm transition-all ${!isStoreOpen ? 'opacity-70 grayscale-[0.5]' : 'active:scale-95'}`}>
                                        <img src={product.image_url} className="w-20 h-20 rounded-[1.2rem] object-cover shadow-md" alt={product.name} />
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-bold text-brand-brown">{product.name}</h4>
                                                <p className="text-[10px] text-neutral-500 italic line-clamp-2">{product.description}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-brand-green font-black">R$ {product.price.toFixed(2)}</span>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className={`p-2.5 rounded-2xl shadow-lg transition-all ${isStoreOpen ? 'bg-brand-green text-white active:scale-90' : 'bg-neutral-200 text-neutral-400'}`}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {view === 'cart' && (
                    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm text-neutral-400">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-brand-brown italic">Meu Cesto</h2>
                        </div>
                        {cart.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <ShoppingBag size={64} className="mx-auto opacity-10 text-brand-brown" />
                                <p className="text-brand-brown/60 italic">Cesto vazio...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-[1.5rem] flex items-center gap-4 shadow-sm border border-brand-peach/10">
                                        <img src={item.image_url} className="w-14 h-14 rounded-xl object-cover" alt={item.name} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-brand-brown text-sm">{item.name}</h4>
                                            <p className="text-brand-green font-bold text-xs">R$ {item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-neutral-100 p-1.5 rounded-xl">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="text-neutral-500"><Minus size={14} /></button>
                                            <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="text-neutral-500"><Plus size={14} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-brand-pink p-2"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'checkout' && (
                    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('cart')} className="p-2 bg-white rounded-full shadow-sm text-neutral-400">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-brand-brown italic">Finalizar</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Opções de Entrega */}
                            <div className="flex bg-neutral-200/50 p-1.5 rounded-full">
                                <button
                                    disabled={!storeSettings.allows_delivery}
                                    onClick={() => setDeliveryMode('delivery')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs transition-all relative ${deliveryMode === 'delivery' ? 'bg-white text-brand-green shadow-md' : 'text-neutral-400 opacity-60'}`}
                                >
                                    <Truck size={18} /> Entrega
                                    {!storeSettings.allows_delivery && <span className="absolute -top-1 bg-neutral-400 text-white text-[7px] px-1.5 rounded-full">Indisponível</span>}
                                </button>
                                <button
                                    onClick={() => setDeliveryMode('pickup')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs transition-all ${deliveryMode === 'pickup' ? 'bg-white text-brand-green shadow-md' : 'text-neutral-500'}`}
                                >
                                    <Store size={18} /> Retirada
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 border border-brand-peach/10">
                                <input
                                    type="text" placeholder="Seu Nome *"
                                    className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-2xl input-focus text-sm font-medium"
                                    value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })}
                                />
                                <input
                                    type="tel" placeholder="Seu WhatsApp *"
                                    className="w-full bg-neutral-50 border border-neutral-100 p-4 rounded-2xl input-focus text-sm font-medium"
                                    value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })}
                                />
                                <div className="bg-brand-peach/5 p-4 rounded-2xl flex items-start gap-3 border border-brand-peach/10">
                                    <MapPin size={20} className="text-brand-green shrink-0 mt-1" />
                                    <div className="text-[11px] text-brand-brown/80">
                                        <p className="font-bold uppercase mb-1">Ponto de Retirada:</p>
                                        {ADDRESS_DISPLAY}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-brand-peach/10 space-y-4">
                                <h4 className="font-bold text-brand-brown text-center text-sm">Pagamento</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Pix', 'Dinheiro', 'Cartão'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method as any)}
                                            className={`p-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${paymentMethod === method ? 'bg-brand-green border-brand-green text-white' : 'bg-white border-neutral-100 text-neutral-500'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'orders' && (
                    <div className="max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4">
                        <button onClick={() => setView('menu')} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-pink-600">
                            <ArrowLeft size={20} />
                            Voltar para o Cardápio
                        </button>

                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="text-pink-600" />
                            Meus Pedidos Recentes
                        </h2>

                        {loadingOrders ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                            </div>
                        ) : myOrders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
                                <button onClick={() => setView('menu')} className="mt-4 text-pink-600 font-medium">Fazer meu primeiro pedido</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myOrders.map(order => (
                                    <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'finished' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status === 'pending' ? '🟡 Aguardando Confirmação' :
                                                        order.status === 'confirmed' ? '🔵 Em Preparo' :
                                                            order.status === 'finished' ? '🟢 Finalizado/Entregue' : order.status}
                                                </span>
                                                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                                            </div>
                                            <span className="font-bold text-pink-600">R$ {order.total.toFixed(2)}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 border-t pt-2">
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span>{item.quantity}x {item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'success' && (
                    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[70vh] space-y-6">
                        <div className="w-20 h-20 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-brown italic">Tudo pronto!</h2>
                        <p className="text-brand-brown/60 text-sm">Chame a vovó no WhatsApp abaixo para confirmar o horário.</p>
                        <button onClick={() => setView('menu')} className="bg-brand-pink text-white px-8 py-4 rounded-full font-bold w-full shadow-lg">Pedir mais</button>
                    </div>
                )}
            </main>

            {/* Footer Fixo */}
            {['menu', 'cart', 'checkout'].includes(view) && (
                <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-brand-peach/10 p-5 pb-8 shadow-2xl z-40">
                    {view === 'menu' && (
                        <button
                            onClick={() => setView('cart')}
                            disabled={cart.length === 0}
                            className="w-full bg-brand-green text-white flex items-center justify-between px-8 py-4 rounded-full font-black shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            <span className="flex items-center gap-2 text-sm"><ShoppingBag size={20} /> Cesto ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                            <span className="text-lg">R$ {total.toFixed(2)}</span>
                        </button>
                    )}
                    {view === 'cart' && cart.length > 0 && (
                        <button
                            onClick={() => setView('checkout')}
                            className="w-full bg-brand-green text-white py-4 rounded-full font-black shadow-xl active:scale-[0.98]"
                        >
                            Finalizar Pedido
                        </button>
                    )}
                    {view === 'checkout' && (
                        <button
                            onClick={handleFinishOrder}
                            disabled={!isStoreOpen}
                            className={`w-full text-white py-4 rounded-full font-black flex items-center justify-center gap-2 shadow-xl transition-all ${isStoreOpen ? 'bg-brand-greenDark active:scale-[0.98]' : 'bg-neutral-300 cursor-not-allowed'}`}
                        >
                            {isStoreOpen ? <><MessageCircle size={20} /> Chamar Vovó no Whats</> : <><AlertCircle size={20} /> Cozinha Fechada</>}
                        </button>
                    )}
                </div>
            )}

            {/* Netinho AI Drawer */}
            {isAiOpen && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center">
                    <div className="bg-white w-full max-w-lg rounded-t-[3rem] shadow-2xl flex flex-col h-[75vh] animate-in slide-in-from-bottom-full duration-300">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-pink flex items-center justify-center overflow-hidden">
                                    <img src={LOGO_URL} className="w-full h-full object-cover" alt="AI" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-brown text-sm">Netinho Virtual</h3>
                                    <p className="text-[8px] font-bold uppercase text-brand-pink tracking-widest">Sempre on-line</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAiOpen(false)} className="p-2 text-neutral-400"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/50">
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-4 rounded-2xl text-xs bg-white text-brand-brown shadow-sm border border-brand-peach/10">
                                    Oi, querido(a)! Como posso te ajudar hoje? ❤️✨
                                </div>
                            </div>
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs ${msg.role === 'user' ? 'bg-brand-pink text-white' : 'bg-white text-brand-brown shadow-sm border border-brand-peach/10'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {aiLoading && <div className="text-[10px] text-brand-pink animate-pulse ml-2">Vovó está me contando...</div>}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-6 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text" placeholder="Qual a sua dúvida?"
                                    className="flex-1 bg-neutral-50 p-4 rounded-2xl text-xs focus:outline-none border border-neutral-100"
                                    value={aiInput} onChange={e => setAiInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAiChat()}
                                />
                                <button onClick={handleAiChat} className="bg-brand-pink text-white p-4 rounded-2xl"><Send size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Footer Info */}
            <footer className="bg-white border-t mt-auto py-6 px-4 text-center text-sm text-gray-500">
                <div className="flex flex-col items-center gap-2">
                    <p className="flex items-center gap-1 justify-center">
                        <MapPin size={16} />
                        {ADDRESS_DISPLAY}
                    </p>
                    <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-pink-600 font-medium hover:underline"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                        @delicias_da_vo_naza
                    </a>
                    <p className="text-xs mt-2">Feito com ❤️ pelo Netinho</p>
                </div>
            </footer>
        </div>
    );
}
