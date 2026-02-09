-- Execute no SQL Editor do Supabase
alter table public.orders 
add column if not exists device_id text;

-- (Opcional) Index para deixar a busca rápida
create index if not exists idx_orders_device_id on public.orders(device_id);
