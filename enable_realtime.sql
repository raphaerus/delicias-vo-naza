-- Habilita o Realtime para as tabelas de pedidos e configurações
-- Isso é necessário para que a tela atualize sozinha quando houver mudanças

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table store_settings;
