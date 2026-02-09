
// ==========================================
// ⚙️ CONFIGURAÇÕES GERAIS
// ==========================================

export const LOGO_URL = "https://i.postimg.cc/d3S35SLS/IMG-20181214-165723-415.jpg";
export const WHATSAPP_NUMBER = '5596981000722'; // Fallback
export const ADDRESS_DISPLAY = "Av. Manoel Pacífico de Cantuário, 125, Pacoval";
export const INSTAGRAM_URL = "https://www.instagram.com/delicias_da_vo_naza/"; // Placeholder or derived if found
export const PIX_KEY = "14675420249";
export const PIX_NAME = "Maria de Nazaré Almeida Chaves";

// ==========================================
// 🚨 ESTADOS INICIAIS (Fallbacks enquanto carrega do banco)
// ==========================================
export const INITIAL_STORE_SETTINGS = {
  id: 0,
  is_open_manual: false,
  opening_time: "12:00",
  closing_time: "21:00",
  delivery_fee: 5.00,
  allows_delivery: false,
  whatsapp_number: WHATSAPP_NUMBER
};
