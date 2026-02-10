# 🥐 Delícias da Vó Naza - Delivery

Um aplicativo de delivery artesanal desenvolvido para a **Vó Naza**, focado em facilidade de uso, estética acolhedora e integração direta com WhatsApp.

![App Preview](https://i.ibb.co/example-preview.png)

## ✨ Funcionalidades

### 📱 Cliente
- **Cardápio em Tempo Real**: Produtos gerenciados via banco de dados (Supabase).
- **Carrinho de Compras**: Gestão dinâmica de itens e quantidades.
- **Rastreamento de Pedidos**: Acompanhamento de status sem login (via ID do dispositivo).
- **Netinho Virtual (IA)**: Assistente integrado com Google Gemini para tirar dúvidas.
- **Status da Loja**: Atualização automática se a loja abrir/fechar.

### 🛡️ Painel Admin (/admin)
- **Gestão de Pedidos**: Receba alertas sonoros e visuais de novos pedidos.
- **Controle de Status**: Mude para "Preparando", "Saiu para Entrega", etc.
- **Gestão de Estoque**: Ative/Desative produtos com um clique.
- **Configurações da Loja**:
    - Abra/Feche a loja manualmente.
    - Defina horários automáticos.
    - Altere a taxa de entrega.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, TailwindCSS.
- **Backend (BaaS)**: Supabase (PostgreSQL, Auth, Realtime).
- **IA**: Google Gemini 2.0 Flash (via API REST).
- **Deploy**: Vercel.

---

## 🚀 Como Instalar e Configurar (Passo a Passo)

### 1. Configuração do Supabase
Crie um projeto em [supabase.com](https://supabase.com) e rode os scripts SQL abaixo no **SQL Editor**:

#### A. Criar Tabelas e Segurança (RLS)
Copie o conteúdo do arquivo `supabase_schema.sql` na raiz do projeto. Isso cria as tabelas `products`, `orders`, `store_settings` e define as regras básicas de segurança.

#### B. Habilitar Atualizações em Tempo Real
Para que o painel admin e o app cliente atualizem sozinhos:
```sql
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table store_settings;
```

#### C. Configurar Permissões do Admin
Para que o admin consiga salvar alterações:
```sql
-- Copie o conteúdo de fix_admin_permissions.sql
create policy "Admins tem acesso total a configs" on public.store_settings for all to authenticated using (true) with check (true);
create policy "Admins tem acesso total a produtos" on public.products for all to authenticated using (true) with check (true);
create policy "Admins tem acesso total a pedidos" on public.orders for all to authenticated using (true) with check (true);
```

### 2. Configuração do Projeto Local

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` na raiz (NÃO envie para o GitHub) com suas chaves:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_publica
   VITE_GEMINI_API_KEY=sua_chave_do_google_aistudio
   ```
4. Rode o projeto:
   ```bash
   npm run dev
   ```

### 3. Deploy na Vercel

1. Importe o projeto do GitHub para a Vercel.
2. Nas configurações do projeto (**Project Settings > Environment Variables**), adicione as mesmas variáveis do passo anterior:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
3. O arquivo `vercel.json` na raiz já configura as rotas para funcionar com React Router.

---

## 🔐 Acesso ao Admin

1. Acesse `/admin` (ex: `seusite.vercel.app/admin`).
2. Crie um usuário no painel do Supabase (**Authentication > Users > Add User**) para ser seu login de administrador.
3. Use este email e senha para entrar.

---

## 📝 Personalização Rápida

Algumas configurações visuais (como Logo e Textos fixos) ainda estão em **`constants.tsx`**.
Os preços e horários são gerenciados diretamente pelo **Painel Admin**.

---

*Feito com carinho para a melhor vovó do mundo!* 👵❤️
