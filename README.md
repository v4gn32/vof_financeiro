# VOF Financeiro - Sistema de Gestão Financeira

## Resumo do Sistema

O **VOF Financeiro** é um sistema completo de gestão financeira pessoal desenvolvido com arquitetura moderna, composto por um frontend em React/TypeScript e um backend em Node.js/Express com banco de dados MySQL.

## Arquitetura do Sistema

### Frontend (vof-financeiro-frontend)
- **Framework:** React 18 com TypeScript
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS
- **Ícones:** Lucide React
- **Roteamento:** React Router DOM
- **Gerenciamento de Estado:** Context API
- **Autenticação:** Supabase (configurado)

### Backend (vof-financeiro-backend)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Tokens)
- **Validação:** Express Validator
- **Segurança:** Helmet, CORS, bcryptjs
- **Upload de Arquivos:** Multer

## Estrutura do Banco de Dados

**Nome do Banco:** `db_financeiro`
**Usuário:** `definir usuario`
**Senha:** `senha`

### Tabelas Principais:
- **users** - Usuários do sistema
- **transactions** - Transações financeiras (receitas/despesas)
- **credit_cards** - Cartões de crédito
- **credit_card_invoices** - Faturas dos cartões
- **investments** - Investimentos
- **notes** - Anotações financeiras

## Funcionalidades

### Gestão de Transações
- Cadastro de receitas e despesas
- Categorização de transações
- Filtros por data, categoria e tipo
- Estatísticas mensais e anuais

### Cartões de Crédito
- Gerenciamento de múltiplos cartões
- Controle de faturas mensais
- Acompanhamento de limites
- Histórico de gastos por cartão

### Investimentos
- Registro de investimentos
- Acompanhamento de rentabilidade
- Categorização por tipo de investimento
- Relatórios de performance

### Anotações
- Sistema de notas organizadas por categoria
- Busca por conteúdo
- Marcação de favoritos
- Filtros avançados

### Dashboard
- Visão geral das finanças
- Gráficos de receitas vs despesas
- Resumo de investimentos
- Indicadores financeiros

### Gestão de Usuários
- Sistema de autenticação seguro
- Perfis de usuário personalizáveis
- Controle de acesso por roles
- Área administrativa

## Tecnologias Utilizadas

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.2",
  "vite": "^4.4.5",
  "tailwindcss": "^3.3.0",
  "react-router-dom": "^6.15.0",
  "lucide-react": "^0.263.1",
  "@supabase/supabase-js": "^2.33.1"
}
```

### Backend
```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-validator": "^7.0.1",
  "multer": "^1.4.5-lts.1"
}
```

## Estrutura de Diretórios

```
vof_financeiro/
├── codigo-fonte/
│   ├── vof-financeiro-frontend/
│   │   ├── src/
│   │   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── context/        # Context API (estado global)
│   │   │   ├── types/          # Definições TypeScript
│   │   │   └── views/          # Páginas da aplicação
│   │   ├── public/
│   │   └── package.json
│   └── vof-financeiro-backend/
│       ├── src/
│       │   ├── config/         # Configurações (DB, etc)
│       │   ├── middleware/     # Middlewares (auth, etc)
│       │   └── routes/         # Rotas da API
│       ├── .env                # Variáveis de ambiente
│       └── package.json
└── README.md
```

## Configuração e Instalação

### Pré-requisitos
- Node.js (v16 ou superior)
- PostgreSQL Server
- npm ou yarn

### 1. Configuração do Banco de Dados
```sql
-- Criar usuário
CREATE USER vagneradmin WITH PASSWORD 'Defina sua senha';

-- Criar banco de dados
CREATE DATABASE db_financeiro OWNER vagneradmin;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE db_financeiro TO vagneradmin;
```

### 2. Backend
```bash
cd codigo-fonte/vof-financeiro-backend
npm install
npm run dev
```

### 3. Frontend
```bash
cd codigo-fonte/vof-financeiro-frontend
npm install
npm run dev
```

## Segurança

- **Autenticação JWT** com tokens seguros
- **Criptografia de senhas** com bcryptjs
- **Validação de entrada** em todas as rotas
- **Proteção CORS** configurada
- **Headers de segurança** com Helmet
- **Controle de acesso** baseado em roles

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Excluir transação

### Cartões de Crédito
- `GET /api/credit-cards` - Listar cartões
- `POST /api/credit-cards` - Criar cartão
- `GET /api/credit-cards/:id/invoices` - Listar faturas

### Investimentos
- `GET /api/investments` - Listar investimentos
- `POST /api/investments` - Criar investimento
- `GET /api/investments/stats` - Estatísticas

### Anotações
- `GET /api/notes` - Listar notas
- `POST /api/notes` - Criar nota
- `GET /api/notes/categories` - Listar categorias

## Status do Projeto

**Concluído:**
- Estrutura completa do frontend React/TypeScript
- Backend Node.js/Express totalmente funcional
- Configuração do banco de dados MySQL
- Sistema de autenticação JWT
- APIs RESTful para todas as funcionalidades
- Remoção de dados mockados

**Próximos Passos:**
- Integração frontend-backend
- Testes automatizados
- Deploy em produção
- Documentação da API (Swagger)

## Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com a necessidade e vontade para gestão financeira eficiente**
