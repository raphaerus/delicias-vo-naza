-- ============================================================================
-- SCHEME DO BANCO DE DADOS - DELÍCIAS DA VÓ NAZA
-- Rode este script no "SQL Editor" do seu painel Supabase.
-- ============================================================================

-- 1. Tabela de PRODUTOS
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  is_available boolean default true,
  category text default 'Salgados'
);

-- Habilitar segurança (RLS)
alter table public.products enable row level security;

-- Política: Qualquer pessoa pode LER os produtos (Select)
create policy "Produtos são públicos"
on public.products for select
to public
using (true);

-- 2. Tabela de CONFIGURAÇÕES DA LOJA
create table public.store_settings (
  id bigint primary key generated always as identity,
  is_open_manual boolean default true,
  opening_time text default '12:00',
  closing_time text default '21:00',
  delivery_fee numeric default 5.00,
  allows_delivery boolean default true,
  whatsapp_number text default '5596981000722'
);

-- Habilitar segurança (RLS)
alter table public.store_settings enable row level security;

-- Política: Qualquer pessoa pode LER as configurações
create policy "Configurações são públicas"
on public.store_settings for select
to public
using (true);

-- Inserir a configuração padrão inicial
insert into public.store_settings (is_open_manual, opening_time, closing_time, delivery_fee, allows_delivery)
values (true, '12:00', '21:00', 5.00, true);

-- 3. Tabela de PEDIDOS (Opcional por enquanto, mas bom para histórico)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_mode text check (delivery_mode in ('pickup', 'delivery')),
  payment_method text,
  total numeric not null,
  items jsonb not null, -- Salva os itens como JSON para simplificar
  status text default 'pending' -- pending, confirmed, finished, cancelled
);

-- Habilitar segurança (RLS)
alter table public.orders enable row level security;

-- Política: Qualquer pessoa pode CRIAR pedidos (Insert)
create policy "Qualquer um pode criar pedidos"
on public.orders for insert
to public
with check (true);

-- DADOS INICIAIS (SEED) PARA POPULAR O CARDÁPIO
insert into public.products (name, description, price, image_url, category)
values
  ('Frango da Vovó', 'Frango desfiado bem temperadinho com o creme secreto da Vó Naza.', 7.00, 'https://i.postimg.cc/66CMDJc5/20260125-181301.jpg', 'Empadas'),
  ('Camarão Especial', 'Camarões selecionados mergulhados no molho de tomate caseiro.', 8.00, 'https://i.postimg.cc/66CMDJc5/20260125-181301.jpg', 'Empadas'),
  ('Palmito Macio', 'Palmito real em creme suave e massa que derrete na boca.', 8.00, 'https://i.postimg.cc/66CMDJc5/20260125-181301.jpg', 'Empadas');
