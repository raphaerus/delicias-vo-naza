-- ============================================================================
-- FIX DE PERMISSÕES PARA O ADMIN (RLS)
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- 1. Permite que Admins (usuários logados) CRIE, LEIA, ATUALIZE e APAGUE Configurações
create policy "Admins tem acesso total a configs"
on public.store_settings
for all
to authenticated
using (true)
with check (true);

-- 2. Permite que Admins CRIE, LEIA, ATUALIZE e APAGUE Produtos
create policy "Admins tem acesso total a produtos"
on public.products
for all
to authenticated
using (true)
with check (true);

-- 3. Permite que Admins LEIA e ATUALIZE Pedidos (Mudar status)
create policy "Admins tem acesso total a pedidos"
on public.orders
for all
to authenticated
using (true)
with check (true);

-- Para garantir que não haja conflitos, estamos usando nomes de policies únicos.
-- Se der erro dizendo que a policy já existe, ignore.
