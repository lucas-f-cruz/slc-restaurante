# Sol e Lua Café — Sistema completo

Cardápio digital do cliente + painel administrativo, com backend Node.js, banco MySQL e
atualização em tempo real via WebSocket. Construído seguindo o prompt de desenvolvimento
do projeto (`prompt-sistema-sol-e-lua.md`).

## Estrutura

```
sol-e-lua/
├── apps/
│   ├── client/       cardápio do cliente (React + Vite + Tailwind)
│   ├── dashboard/     painel administrativo (React + Vite + Tailwind)
│   └── server/        API + WebSocket (Node.js + Express + Drizzle ORM)
├── packages/
│   └── shared/         tipos TypeScript compartilhados pelos três apps
├── deploy/
│   └── nginx.conf.example
└── ecosystem.config.cjs   configuração do PM2
```

## Decisão técnica importante: Drizzle ORM em vez de Prisma

O prompt original sugeria "Prisma (recomendado) ou Drizzle". Optamos por **Drizzle ORM**
porque ele não depende de binários nativos baixados de um domínio externo no momento do
`generate` — é TypeScript puro sobre o driver `mysql2`. Mais leve, mais fácil de instalar
em qualquer ambiente restrito (CI, containers, VPS enxuta), e com o mesmo nível de
segurança de tipos que o Prisma ofereceria.

## Pré-requisitos

- Node.js 20+
- MySQL 8 ou MariaDB 10.11+ rodando (local ou na VPS)

## Setup local

```bash
# 1. Instalar dependências de todo o monorepo
npm install

# 2. Configurar o banco
cp apps/server/.env.example apps/server/.env
# edite apps/server/.env com as credenciais do seu MySQL

# 3. Criar as tabelas no banco (schema em apps/server/src/db/schema.ts)
npm run -w apps/server db:push

# 4. Popular com os dados iniciais: categorias, cardápio completo (101 produtos reais),
#    20 mesas e o usuário administrador padrão
npm run -w apps/server seed

# 5. Rodar os três serviços (em três terminais separados)
npm run dev:server      # API + WebSocket em http://localhost:4000
npm run dev:client      # Cardápio em http://localhost:5173
npm run dev:dashboard   # Painel em http://localhost:5174
```

**Login padrão do painel:** usuário `soleluacafe`, senha `123`
(troque a senha assim que possível — vá em Configurações → Usuários → Editar).

**Simular o QR Code de uma mesa em desenvolvimento:** acesse
`http://localhost:5173/?mesa=07` — é exatamente a URL que os QR Codes reais geram.

## Build de produção

```bash
npm run build
```

Isso gera:
- `apps/server/dist/` — API compilada (JavaScript puro, rodado com `node dist/index.js`)
- `apps/client/dist/` — build estático do cardápio (arquivos para servir via Nginx)
- `apps/dashboard/dist/` — build estático do painel (idem)

Antes de buildar os front-ends para produção, configure as URLs públicas:

```bash
# apps/client/.env
VITE_DASHBOARD_URL=https://painel.soleluacafe.com.br

# apps/dashboard/.env
VITE_CLIENT_URL=https://cardapio.soleluacafe.com.br
```

## Deploy na VPS

Abordagem testada e recomendada: **dois subdomínios** apontando para o mesmo servidor —
`cardapio.seudominio.com.br` (cliente) e `painel.seudominio.com.br` (equipe). Evita ter
que configurar `base path` no Vite, que é uma fonte comum de bugs sutis de asset quebrado.

1. **Provisionar a VPS** (Ubuntu 22.04+): instalar Node.js 20, MySQL, Nginx, PM2.
   ```bash
   sudo apt update && sudo apt install -y nginx mysql-server
   sudo npm install -g pm2
   ```

2. **Criar o banco e o usuário MySQL**
   ```sql
   CREATE DATABASE sol_e_lua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'soleluac'@'localhost' IDENTIFIED BY 'uma-senha-forte-aqui';
   GRANT ALL PRIVILEGES ON sol_e_lua.* TO 'soleluac'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Enviar o código para a VPS** (git clone ou scp) em `/var/www/sol-e-lua`.

4. **Configurar variáveis de ambiente de produção**
   - `apps/server/.env` com a `DATABASE_URL` real e um `JWT_SECRET` forte e aleatório
     (ex: `openssl rand -hex 32`).
   - `apps/client/.env` e `apps/dashboard/.env` com as URLs públicas reais.

5. **Instalar, migrar, popular e buildar**
   ```bash
   npm install
   npm run -w apps/server db:push
   npm run -w apps/server seed        # só na primeira vez
   npm run build
   ```

6. **Subir a API com PM2**
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup   # segue as instruções impressas para a API voltar sozinha após reboot
   ```

7. **Configurar o Nginx** — copie `deploy/nginx.conf.example` para
   `/etc/nginx/sites-available/sol-e-lua`, ajuste os domínios, ative e teste:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sol-e-lua /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

8. **Apontar o DNS** dos dois subdomínios para o IP da VPS, depois ativar HTTPS:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d cardapio.soleluacafe.com.br -d painel.soleluacafe.com.br
   ```
   HTTPS não é opcional aqui — o QR Code circula fisicamente nas mesas do restaurante.

9. **Gerar e imprimir os QR Codes reais**: entre no painel → QR Codes → "Imprimir todos
   os QR Codes". Cada QR já aponta para `https://cardapio.seudominio.com.br/?mesa=NN`.

## O que está implementado e testado de verdade

Todo o backend foi testado contra um MySQL real durante o desenvolvimento (não é só
código "no papel"): seed populando 101 produtos/12 seções/20 mesas, login com JWT,
criação de pedido com preço recalculado no servidor, avanço de status, bloqueio real de
exclusão de mesa com pedido ativo, e permissões por papel aplicadas de fato (testado com
um usuário "cozinha" tentando ações de admin e recebendo 403).

Os dois front-ends foram testados rodando junto com a API real: cliente cria um pedido
pelo cardápio, e esse mesmo pedido aparece no dashboard puxando os dados do mesmo banco
— o fluxo de ponta a ponta funciona.

## Simplificações conscientes desta primeira versão

Documentadas para você decidir se quer que eu aprofunde em alguma:

- **Reconexão de WebSocket** já tem backoff exponencial, mas não há fila de eventos
  perdidos durante a desconexão — ao reconectar, as telas fazem um `refresh` via REST
  para garantir consistência, então nada fica desatualizado, só não é "replay" do que
  perdeu.
- **Som de notificação** no dashboard toca sempre que chega um pedido novo; o toggle
  de "som" em Configurações ainda não está conectado a essa lógica (fica true por
  padrão). Fácil de ligar — é só ler `configuracoes.soundEnabled` no `LiveDataContext`.
- **Indicador "Restaurante aberto/fechado"** no topo do painel busca a configuração ao
  trocar de tela, não está em tempo real via WebSocket — só quem está com o painel aberto
  há muito tempo sem navegar não veria a mudança instantaneamente.
- **Categorias mais vendidas** (que existia no protótipo estático) não tem endpoint
  próprio ainda; dá para derivar a partir de `/relatorios/produtos-mais-vendidos` cruzando
  com a seção de cada produto, mas não implementei essa tela específica.
- **"Adicionar pedido" manual** pela recepção ainda não tem uma UI própria de seleção de
  produtos no dashboard (o endpoint da API já aceita perfeitamente — falta só o formulário).

Nenhuma dessas é uma limitação de arquitetura — são só telas/detalhes que ficaram de fora
desta primeira entrega para focar no que mais importa: login real, banco real, permissões
reais, tempo real de verdade entre cliente e cozinha.
