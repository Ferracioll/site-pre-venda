# Edição de Colecionador — Landing Page de Pré-venda (Captura de Leads)

Projeto full stack para validar demanda de mercado e capturar interessados
antes da fabricação/impressão em massa de uma edição especial de
colecionador. Stack: **HTML5 + Bootstrap 5 + JS nativo** (frontend),
**Node.js + Express** (API REST) e **MySQL** (persistência).

---

## 1. Arquitetura & Estrutura de Pastas

```
hp-presale/
├── config/
│   └── db.js                # Pool de conexão MySQL (mysql2/promise)
├── routes/
│   └── interessados.js      # Rotas POST /api/interessados e GET /api/interessados
├── public/                  # Frontend estático servido pelo Express
│   ├── index.html
│   ├── css/style.css
│   └── js/script.js
├── sql/
│   └── schema.sql           # Criação do banco + tabela interessados
├── .env.example              # Modelo de variáveis de ambiente
├── package.json
├── server.js                 # Bootstrap da aplicação Express
└── README.md
```

**Padrão arquitetural:** MVC simplificado / camadas —
`server.js` (bootstrap) → `routes/` (controllers REST) → `config/db.js`
(acesso a dados). O frontend é desacoplado, consumindo a API somente via
`fetch()`, o que permite trocar o frontend (ex.: React) no futuro sem
tocar no backend.

```
┌─────────────┐      fetch (JSON)      ┌──────────────┐      mysql2       ┌───────────┐
│  index.html  │ ───────────────────▶ │  Express API  │ ───────────────▶ │   MySQL   │
│  + Bootstrap │ ◀─────────────────── │  (routes/)    │ ◀─────────────── │ interessados │
└─────────────┘      JSON de resposta  └──────────────┘      resultset    └───────────┘
```

---

## 2. Modelagem de Dados

### Diagrama ER (conceitual)

```
┌───────────────────────────────┐
│          interessados          │
├───────────────────────────────┤
│ PK  id               INT       │
│     nome_completo     VARCHAR  │
│ UQ  email             VARCHAR  │
│     telefone          VARCHAR  │
│     quantidade        SMALLINT │
│     aceite_termos     TINYINT  │
│     origem             VARCHAR  │
│     created_at        TIMESTAMP│
└───────────────────────────────┘
```

Entidade única para o MVP (não há relacionamentos ainda). `email` é
`UNIQUE` para evitar cadastros duplicados do mesmo lead. Ver script
completo em [`sql/schema.sql`](./sql/schema.sql).

### Wireframe estrutural (mobile-first)

```
[ Header: logo | CTA ]
[ Hero: título + subtítulo + CTA + selo/estatísticas ]
[ Galeria: 3 blocos alternados (capa / bordas / mapa) ]
[ Especificações (ficha técnica) | Como funciona a pré-venda ]
[ Formulário: nome, e-mail, telefone, quantidade, aceite ]
[ Footer ]
[ Modal de confirmação (após POST bem-sucedido) ]
```

---

## 3. Requisitos cobertos

| Requisito | Onde está implementado |
|---|---|
| RF01 — Landing page responsiva | `public/index.html` + `public/css/style.css` (Bootstrap 5 + grid customizado, breakpoints em `style.css`) |
| RF02 — Formulário de captura | Seção `#form-preVenda` em `index.html` |
| RF03 — Validação client-side | `public/js/script.js` (regex de e-mail/telefone, campos obrigatórios) |
| RF04 — Feedback via modal sem reload | `fetch()` + `bootstrap.Modal` em `script.js` |
| RF05 — Persistência em MySQL com timestamp | `config/db.js` + coluna `created_at` (`schema.sql`) |
| RF06 — Endpoints REST | `routes/interessados.js` (`POST` e `GET /api/interessados`) |

> **Nota de segurança:** a validação client-side (RF03) melhora a UX, mas
> o backend **revalida tudo** em `routes/interessados.js` — nunca confie
> apenas no que o navegador envia.

---

## 4. Como rodar localmente

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 8+ instalado e em execução (local ou Docker)

### Passo a passo

**1. Instale as dependências**
```bash
cd hp-presale
npm install
```

**2. Crie o banco de dados**
```bash
mysql -u root -p < sql/schema.sql
```
(ou copie/cole o conteúdo de `sql/schema.sql` no MySQL Workbench / DBeaver)

**3. Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o `.env` com o usuário/senha do seu MySQL local:
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=presale_livro_colecionador
```

**4. Suba o servidor**
```bash
npm start
# ou, com reload automático durante o desenvolvimento:
npm run dev
```

**5. Acesse no navegador**
```
http://localhost:3000
```

O Express já serve o frontend estático (pasta `public/`) e a API no
mesmo domínio/porta, então não há CORS para configurar em uso local.

---

## 5. Testando a API diretamente (sem o formulário)

```bash
# Cadastrar um interessado
curl -X POST http://localhost:3000/api/interessados \
  -H "Content-Type: application/json" \
  -d '{
        "nome_completo": "Ana Clara Souza",
        "email": "ana.souza@example.com",
        "telefone": "11987654321",
        "quantidade": 2,
        "aceite_termos": true
      }'

# Listar interessados cadastrados
curl http://localhost:3000/api/interessados

# Verificar se o servidor está de pé
curl http://localhost:3000/api/health
```

### Checklist de testes de integração (frontend + backend)
1. Enviar o formulário com todos os campos válidos → esperar modal de
   confirmação e status `201` no Network tab.
2. Enviar com e-mail já cadastrado → esperar mensagem de erro (`409`).
3. Enviar com campos vazios → validação client-side deve bloquear o
   envio antes de qualquer requisição de rede.
4. Enviar telefone/e-mail em formato inválido → mensagens de erro
   específicas por campo (bordas vermelhas do Bootstrap).
5. Derrubar o MySQL propositalmente e reenviar → deve exibir erro de
   "falha de conexão" no formulário, sem quebrar a página.
6. Testar em viewport mobile (375px) e desktop (1440px) — layout deve
   se adaptar sem overflow horizontal.

---

## 6. Sprints & Entregáveis

| Sprint | Entregável |
|---|---|
| **1 — Concepção & Modelagem** | `sql/schema.sql`, diagrama ER e wireframe (este README) |
| **2 — Interface & UX** | `public/index.html`, `public/css/style.css`, `public/js/script.js` |
| **3 — API & Persistência** | `server.js`, `config/db.js`, `routes/interessados.js` |
| **4 — Testes & Finalização** | Checklist de testes (seção 5), estrutura de repositório (seção 7) e roteiro de pitch (seção 8) |

---

## 7. Estrutura sugerida para o repositório GitHub

```
repo/
├── .gitignore          # incluir: node_modules/, .env
├── README.md            # este arquivo
├── docs/
│   ├── wireframe.png     # export do wireframe (Figma/Excalidraw)
│   └── diagrama-er.png
├── sql/schema.sql
├── config/db.js
├── routes/interessados.js
├── public/
├── server.js
├── package.json
└── .env.example
```

Sugestão de branches: `main` (estável) e `dev` (integração), com
Pull Requests por sprint (`sprint-1-modelagem`, `sprint-2-frontend`,
`sprint-3-backend`, `sprint-4-testes`).

---

## 8. Roteiro de apresentação / Pitch (5 minutos)

1. **Problema (30s):** fabricar uma tiragem física de colecionador é
   caro e arriscado sem validar demanda antes.
2. **Solução (30s):** landing page de pré-venda que captura leads
   qualificados (nome, contato, quantidade desejada) antes de investir
   em produção.
3. **Demo ao vivo (2min):** abrir a landing page → rolar pela proposta
   de valor → preencher o formulário → mostrar o modal de confirmação
   → abrir `GET /api/interessados` mostrando o lead salvo com
   `created_at`.
4. **Arquitetura (1min):** mostrar o diagrama frontend → API → MySQL
   (seção 1) e explicar a dupla validação (client + servidor).
5. **Próximos passos (1min):** dashboard administrativo para os leads,
   disparo de e-mail transacional de confirmação, integração com
   gateway de pagamento na etapa de produção confirmada.
