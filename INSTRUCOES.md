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

---

## Notificações por E-mail

Ao **abrir um novo protocolo**, o sistema envia automaticamente um e-mail para o
**destinatário escolhido** (o e-mail vem do cadastro do funcionário no setor).

> O envio só acontece se as variáveis SMTP estiverem configuradas. Sem elas, o
> sistema funciona normalmente, apenas sem enviar e-mails.

### Configurar (Gmail / Google Workspace — ex.: @csa.g12.br)

1. Ative a **verificação em duas etapas** na conta Google.
2. Gere uma **Senha de app** (Conta Google → Segurança → Senhas de app).
3. Defina as variáveis de ambiente (no `.env` local ou no painel do Render):

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="seu_email@csa.g12.br"
SMTP_PASS="senha_de_app_16_digitos"   # NÃO a senha normal da conta
EMAIL_FROM="Protocolo Digital <seu_email@csa.g12.br>"
APP_URL="https://protocolodigital.onrender.com"   # link nos e-mails
```

> **Importante:** para o e-mail chegar, o funcionário destinatário precisa ter
> **e-mail cadastrado** (em Setores → funcionários do setor).

### E-mail do prazo do lembrete (ainda desabilitado)

O e-mail de lembrete (na data de `lembreteData`) **ainda não é enviado** — a
função existe (`enviarEmailLembrete`), mas falta um agendador. Para habilitar:

1. Adicionar `lembreteEnviado Boolean @default(false)` ao modelo `Protocolo`
   (`schema.prisma`) para evitar envios duplicados.
2. Criar um agendador (node-cron no backend **ou** um Render Cron Job) que rode
   periodicamente, busque protocolos com `lembreteData <= hoje` e
   `lembreteEnviado = false`, chame `enviarEmailLembrete()` e marque como enviado.
