# Configuração do Banco de Dados PostgreSQL

## Pré-requisitos
- PostgreSQL Server instalado e rodando
- pgAdmin 4 ou acesso via psql
- Acesso como superuser do PostgreSQL

## Passos para Configuração

### 1. Conectar ao PostgreSQL
**Via pgAdmin 4:**
- Abra o pgAdmin 4
- Conecte ao servidor PostgreSQL
- Clique com botão direito em "Databases"

**Via psql:**
```bash
psql -U postgres
```

### 2. Criar usuário e banco de dados
```sql
-- Criar usuário
CREATE USER vagneradmin WITH PASSWORD 'Mudar2025';

-- Criar banco de dados
CREATE DATABASE db_financeiro OWNER vagneradmin;

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE db_financeiro TO vagneradmin;

-- Conectar ao banco criado
\c db_financeiro;

-- Conceder privilégios no schema public
GRANT ALL ON SCHEMA public TO vagneradmin;
```

### 3. Executar o script de criação das tabelas
**Via pgAdmin 4:**
1. Conecte ao banco `db_financeiro`
2. Abra o Query Tool
3. Copie e cole o conteúdo do arquivo `src/config/database-setup.sql`
4. Execute o script

**Via psql:**
```bash
psql -U vagneradmin -d db_financeiro -f src/config/database-setup.sql
```

### 4. Verificar a instalação
```sql
-- Listar tabelas
\dt

-- Verificar estrutura de uma tabela
\d users
```

Você deve ver as seguintes tabelas:
- users
- transactions
- credit_cards
- credit_card_invoices
- investments
- notes

### 5. Testar conexão do backend
```bash
npm install
npm run dev
```

O servidor deve iniciar na porta 3001 e conectar ao PostgreSQL com sucesso.

## Configurações de Conexão
As configurações estão no arquivo `.env`:
- **Host:** localhost
- **Porta:** 5432
- **Banco:** db_financeiro
- **Usuário:** vagneradmin
- **Senha:** Mudar2025

## Troubleshooting

### Erro de conexão
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão manualmente: `psql -U vagneradmin -d db_financeiro`

### Erro de privilégios
```sql
-- Conectar como superuser
\c db_financeiro postgres

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE db_financeiro TO vagneradmin;
GRANT ALL ON SCHEMA public TO vagneradmin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO vagneradmin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO vagneradmin;
```

### Erro de extensão UUID
```sql
-- Conectar ao banco como superuser
\c db_financeiro postgres

-- Criar extensão
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Comandos Úteis do PostgreSQL

### Via psql
```bash
# Conectar ao banco
psql -U vagneradmin -d db_financeiro

# Listar bancos
\l

# Listar tabelas
\dt

# Descrever tabela
\d nome_da_tabela

# Sair
\q
```

### Via pgAdmin 4
- **Backup:** Botão direito no banco → Backup
- **Restore:** Botão direito no banco → Restore
- **Query Tool:** Botão direito no banco → Query Tool