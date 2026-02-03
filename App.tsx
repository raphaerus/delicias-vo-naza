
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
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
  Phone,
  Info,
  Instagram
} from 'lucide-react';
import { PRODUCTS, DELIVERY_FEE, WHATSAPP_NUMBER, LOGO_URL } from './constants';
import { CartItem, UserData, PaymentMethod, Order } from './types';
import { GoogleGenAI } from "@google/genai";

type View = 'menu' | 'cart' | 'checkout' | 'success';
type DeliveryMode = 'pickup' | 'delivery';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  
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
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const currentDeliveryFee = deliveryMode === 'delivery' ? DELIVERY_FEE : 0;
  const total = useMemo(() => subtotal + (subtotal > 0 ? currentDeliveryFee : 0), [subtotal, currentDeliveryFee]);

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
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

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const formatWhatsAppMessage = (order: Order) => {
    const itemsText = order.items
      .map(item => `• *${item.quantity}x ${item.name}* (R$ ${(item.price * item.quantity).toFixed(2)})`)
      .join('\n');

    const deliveryInfo = order.deliveryMode === 'pickup' 
      ? '🏪 *TIPO: RETIRADA NO LOCAL*' 
      : '🛵 *TIPO: ENTREGA EM DOMICÍLIO*';

    return `
🧀 *NOVO PEDIDO - DELÍCIAS DA VÓ NAZA* 🧀

*Data:* ${new Date().toLocaleString('pt-BR')}

${deliveryInfo}

*Itens do Pedido:*
${itemsText}

*Subtotal:* R$ ${subtotal.toFixed(2)}
${order.deliveryMode === 'delivery' ? `*Taxa de Entrega:* R$ ${DELIVERY_FEE.toFixed(2)}` : '*Taxa de Entrega:* R$ 0,00'}
*TOTAL:* R$ ${order.total.toFixed(2)}

---
*Dados do Cliente:*
👤 *Nome:* ${order.customer.name}
📞 *Tel:* ${order.customer.phone}
${order.deliveryMode === 'delivery' ? `
📍 *Endereço:* ${order.customer.address}, nº ${order.customer.number}
🏘️ *Bairro:* ${order.customer.neighborhood}
📮 *CEP:* ${order.customer.zipCode}
${order.customer.complement ? `✨ *Compl:* ${order.customer.complement}` : ''}
` : '📍 *Retirada agendada:* Av. Manoel Pacífico de Cantuário, 125 - Pacoval.'}

---
💳 *Pagamento:* ${order.paymentMethod}
`.trim();
  };

  const handleFinishOrder = () => {
    const { name, phone, address, neighborhood, number } = userData;
    
    if (deliveryMode === 'delivery' && (!name || !phone || !address || !neighborhood || !number)) {
      alert('Por favor, preencha todos os campos obrigatórios para entrega.');
      return;
    }

    if (deliveryMode === 'pickup' && (!name || !phone)) {
      alert('Por favor, informe seu nome e telefone para a retirada.');
      return;
    }

    const order: Order = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cart,
      customer: userData,
      paymentMethod,
      total,
      deliveryMode
    };

    const message = formatWhatsAppMessage(order);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Você é o Netinho(a) Virtual, o assistente carinhoso das "Delícias da Vó Naza". 
Você é neto(a) da Vó Naza e ajuda os clientes com o cardápio maravilhoso dela.
O cardápio é:
${PRODUCTS.map(p => `- ${p.name}: ${p.description} (R$ ${p.price.toFixed(2)})`).join('\n')}
Fale de forma bem amorosa, use "querido(a)", use emojis de coração e comida. Diga que a vovó está na cozinha preparando tudo com muito carinho. O endereço é no Pacoval.

Pergunta: ${userMsg}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiMessages(prev => [...prev, { role: 'ai', text: response.text || "A vovó me chamou ali e eu me perdi. Pode repetir?" }]);
    } catch (e) {
      setAiMessages(prev => [...prev, { role: 'ai', text: "Ih, a internet do Pacoval oscilou! Pode tentar de novo?" }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-peach/30 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('menu')}>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-green shadow-lg flex items-center justify-center">
            <img 
              src={LOGO_URL} 
              alt="Logo Vó Naza" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('p-2');
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-brown leading-none">Delícias da Vó Naza</h1>
            <span className="text-[10px] text-brand-pink font-bold uppercase tracking-wider">Sabor irresistível</span>
          </div>
        </div>
        <button 
          onClick={() => setIsAiOpen(true)}
          className="p-2 bg-brand-pink/10 text-brand-pink rounded-full hover:bg-brand-pink/20 transition-all flex items-center gap-1"
        >
          <Sparkles size={20} />
          <span className="text-[10px] font-bold uppercase hidden sm:inline">Assistente</span>
        </button>
      </header>

      {/* Main View */}
      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {view === 'menu' && (
          <div className="p-4 space-y-6 animate-in fade-in duration-500">
            {/* Banner com a foto da empada */}
            <div className="relative h-52 rounded-[2.5rem] overflow-hidden group shadow-xl border-4 border-brand-peach/20">
              <img src={PRODUCTS[0].image} className="w-full h-full object-cover brightness-90 transition-transform duration-1000 group-hover:scale-110" alt="Banner Vó Naza" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
                <h2 className="text-white text-3xl font-bold italic">O Amor da Vovó</h2>
                <p className="text-brand-peach text-sm font-medium">Empadas artesanais feitas com carinho.</p>
              </div>
            </div>

            {/* Informações de Contato Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <a href="https://instagram.com/deliciasvonaza" target="_blank" className="bg-white p-4 rounded-3xl shadow-sm border border-brand-peach/10 flex items-center gap-3 active:scale-95 transition-all">
                <div className="p-2 bg-brand-pink/10 text-brand-pink rounded-xl">
                  <Instagram size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Siga a vovó</span>
                  <span className="text-[11px] font-bold text-brand-brown">@deliciasvonaza</span>
                </div>
              </a>
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-peach/10 flex items-center gap-3">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase">Onde estamos</span>
                  <span className="text-[11px] font-bold text-brand-brown">Pacoval, Macapá</span>
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-brand-brown italic px-2">Cardápio da Vovó</h3>
              <div className="grid gap-5">
                {PRODUCTS.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-[2rem] flex gap-5 shadow-sm border border-brand-peach/10 group active:scale-[0.98] transition-all">
                    <img src={product.image} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-md" alt={product.name} />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-brand-brown text-lg">{product.name}</h4>
                        <p className="text-[10px] text-neutral-500 italic mt-1 leading-relaxed">"{product.description}"</p>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-brand-green font-black text-lg">R$ {product.price.toFixed(2)}</span>
                        <button 
                          onClick={() => addToCart(product)}
                          className="bg-brand-green text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all hover:bg-brand-greenDark"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Rodapé do Menu */}
            <div className="p-6 bg-brand-peach/10 rounded-[2.5rem] border border-brand-peach/20 text-center space-y-1">
               <p className="text-[10px] font-bold text-brand-brown/60 uppercase tracking-widest">Endereço para Retirada</p>
               <p className="text-sm text-brand-brown font-medium leading-relaxed">
                 Av. Manoel Pacífico de Cantuário, 125<br/>Pacoval, Macapá - AP
               </p>
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('menu')} className="p-2 bg-white rounded-full shadow-sm text-neutral-400">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-brand-brown italic">Cesto de Gostosuras</h2>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-400 space-y-4">
                <ShoppingBag size={80} className="opacity-10 text-brand-brown" />
                <p className="font-medium text-center italic text-brand-brown/60">O cesto está vazio!<br/>A vovó está esperando seu pedido.</p>
                <button onClick={() => setView('menu')} className="text-brand-pink font-bold uppercase text-xs">Ver Cardápio</button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-[2rem] flex items-center gap-4 shadow-sm border border-brand-peach/10">
                    <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" alt={item.name} />
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-brown">{item.name}</h4>
                      <p className="text-brand-green font-bold text-sm">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-neutral-100 p-1.5 rounded-2xl">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-neutral-500"><Minus size={16} /></button>
                      <span className="font-bold text-sm w-4 text-center text-brand-brown">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-neutral-500"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-brand-pink p-2"><Trash2 size={18} /></button>
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
              <h2 className="text-2xl font-bold text-brand-brown italic">Quase lá, querido(a)</h2>
            </div>

            <div className="space-y-6">
              {/* Opção de Entrega */}
              <div className="flex bg-neutral-200/50 p-2 rounded-[2.5rem] relative">
                <div className="flex-1 relative">
                   <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[2.1rem] font-bold text-sm transition-all text-neutral-400 opacity-60 cursor-not-allowed"
                  >
                    <Truck size={20} /> Entrega
                  </button>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-peach/20 text-brand-brown text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm border border-brand-peach/40 animate-pulse">
                    Em breve
                  </div>
                </div>
                
                <button 
                  onClick={() => setDeliveryMode('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2.1rem] font-bold text-sm transition-all ${deliveryMode === 'pickup' ? 'bg-white text-brand-green shadow-lg' : 'text-neutral-500'}`}
                >
                  <Store size={20} /> Retirada
                </button>
              </div>

              {/* Formulário de Dados */}
              <div className="bg-white p-7 rounded-[3rem] shadow-sm space-y-5 border border-brand-peach/10">
                <h4 className="font-bold text-brand-brown italic flex items-center gap-2">
                  <span className="p-1.5 bg-brand-green/10 text-brand-green rounded-lg"><CheckCircle size={16} /></span>
                  Seus dados de contato
                </h4>
                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Seu Nome Completo *" 
                    className="w-full bg-neutral-50 border border-neutral-100 p-5 rounded-[1.5rem] input-focus font-medium text-brand-brown"
                    value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})}
                  />
                  <input 
                    type="tel" placeholder="Seu WhatsApp (96) 9... *" 
                    className="w-full bg-neutral-50 border border-neutral-100 p-5 rounded-[1.5rem] input-focus font-medium text-brand-brown"
                    value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})}
                  />
                </div>
                
                <div className="bg-brand-peach/10 p-5 rounded-[2rem] flex items-start gap-4 border border-brand-peach/20">
                  <MapPin size={24} className="text-brand-green shrink-0 mt-1" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-brand-brown uppercase tracking-tight">Retirada na Loja</p>
                    <p className="text-[11px] text-brand-brown/80 leading-relaxed">
                      Av. Manoel Pacífico de Cantuário, 125<br />Pacoval - Macapá.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="bg-white p-7 rounded-[3rem] shadow-sm space-y-5 border border-brand-peach/10 text-center">
                <h4 className="font-bold text-brand-brown italic">Como deseja pagar?</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'].map((method) => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={`p-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-tight border transition-all ${paymentMethod === method ? 'bg-brand-green border-brand-green text-white shadow-lg' : 'bg-white border-neutral-100 text-neutral-500'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'success' && (
          <div className="p-10 text-center flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-brand-green/10">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-brand-brown italic tracking-tight">Prontinho, Querido(a)!</h2>
              <p className="text-brand-brown/60 text-sm max-w-[280px] mx-auto leading-relaxed">Seu pedido já está no ponto. Clique no botão abaixo para chamar a vovó no WhatsApp!</p>
            </div>
            <button 
              onClick={() => setView('menu')} 
              className="bg-brand-pink text-white px-10 py-5 rounded-[2.5rem] font-bold w-full shadow-2xl active:scale-95 transition-all"
            >
              Pedir mais delícias
            </button>
          </div>
        )}
      </main>

      {/* Footer Fixo */}
      {['menu', 'cart', 'checkout'].includes(view) && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-xl border-t border-brand-peach/10 p-6 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.08)] z-[60]">
           {view === 'menu' && (
             <button 
               onClick={() => setView('cart')} 
               disabled={cart.length === 0}
               className="w-full bg-brand-green text-white flex items-center justify-between px-10 py-5 rounded-[2.5rem] font-black shadow-2xl disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] hover:bg-brand-greenDark"
             >
               <span className="flex items-center gap-3"><ShoppingBag size={24} /> Meu Cesto ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
               <span className="text-xl">R$ {total.toFixed(2)}</span>
             </button>
           )}
           {view === 'cart' && cart.length > 0 && (
             <button 
                onClick={() => setView('checkout')} 
                className="w-full bg-brand-green text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-[0.98] transition-all hover:bg-brand-greenDark"
             >
               Ir para Finalizar
             </button>
           )}
           {view === 'checkout' && (
             <button 
                onClick={handleFinishOrder} 
                className="w-full bg-brand-greenDark text-white py-5 rounded-[2.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all"
             >
               <MessageCircle size={24} /> Enviar Pedido no Whats
             </button>
           )}
        </div>
      )}

      {/* Netinho Virtual AI Drawer */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-[4rem] shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-full duration-300 border-t-8 border-brand-pink/20">
            <div className="p-8 border-b border-brand-peach/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1rem] overflow-hidden bg-brand-pink shadow-xl flex items-center justify-center">
                  <img src={LOGO_URL} alt="Logo Assistente" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-brown leading-none tracking-tight text-xl">Netinho Virtual</h3>
                  <span className="text-[10px] text-brand-pink font-bold uppercase tracking-widest">Ajudando a Vovó</span>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-3 bg-neutral-100 rounded-full text-neutral-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar bg-neutral-50/30">
              <div className="flex justify-start">
                <div className="max-w-[85%] p-5 rounded-[2rem] text-sm bg-white text-brand-brown leading-relaxed shadow-sm border border-brand-peach/10">
                  Olá, querido(a)! Eu sou o netinho da <b>Vó Naza</b>. Estou aqui para te contar quais empadas saíram agora do forno! ✨🥐❤️
                </div>
              </div>
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm ${
                    msg.role === 'user' ? 'bg-brand-pink text-white shadow-xl' : 'bg-white text-brand-brown shadow-sm border border-brand-peach/10'
                  } leading-relaxed`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-1.5 ml-4">
                  <div className="w-2 h-2 bg-brand-pink rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-pink rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-brand-pink rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-white border-t border-brand-peach/10">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" placeholder="Qual a dica de hoje?"
                  className="flex-1 bg-neutral-50 border border-neutral-100 p-5 rounded-[2rem] focus:outline-none input-focus shadow-inner font-medium text-brand-brown"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAiChat()}
                />
                <button 
                  onClick={handleAiChat} 
                  className="bg-brand-pink text-white p-5 rounded-3xl transition-all active:scale-90 shadow-xl"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}