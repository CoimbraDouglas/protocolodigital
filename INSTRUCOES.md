# Sistema de Protocolo Digital — Instruções de Instalação

## Pré-requisitos
- Node.js (versão LTS) — https://nodejs.org
- PostgreSQL — https://www.postgresql.org/download/windows/

---

## 1. Configurar o Banco de Dados (PostgreSQL)

1. Abra o pgAdmin ou o terminal do PostgreSQL
2. Crie um banco de dados:
   ```sql
   CREATE DATABASE protocolodigital;
   ```

---

## 2. Configurar o Backend

```bash
cd C:\Users\douglas.laass\Downloads\protocolodigital\backend

# Copiar arquivo de variáveis de ambiente
copy .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/protocolodigital"
JWT_SECRET="chave_secreta_forte_aqui"
PORT=3001
```

```bash
# Instalar dependências
npm install

# Criar as tabelas no banco
npm run db:migrate

# Popular dados iniciais (setores + usuário admin)
npm run db:seed

# Iniciar o servidor
npm run dev
```

O backend estará em: http://localhost:3001

---

## 3. Configurar o Frontend

```bash
cd C:\Users\douglas.laass\Downloads\protocolodigital\frontend

# Instalar dependências
npm install

# Iniciar o frontend
npm run dev
```

O sistema estará em: http://localhost:5173

---

## 4. Primeiro Acesso

| Campo | Valor |
|-------|-------|
| E-mail | admin@protocolo.com |
| Senha | admin123 |

---

## Estrutura do Sistema

- **Dashboard** — totais e protocolos por setor
- **Protocolos** — lista, busca, filtros por status/tipo
- **Novo Protocolo** — cadastro com numeração automática (00001/2026)
- **Detalhe do Protocolo** — linha do tempo de tramitações, tramitar entre setores, alterar status
- **Setores** — gerenciar setores da organização
- **Usuários** — gerenciar usuários e perfis (somente Admin)

## Perfis de Acesso

| Perfil | Permissões |
|--------|-----------|
| ADMIN | Acesso total, gerencia usuários e setores |
| OPERADOR | Cadastra e tramita protocolos |
| VISUALIZADOR | Apenas visualiza |
