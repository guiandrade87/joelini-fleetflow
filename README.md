# 🚛 Joelini FleetFlow

Sistema completo de Gestão de Frota desenvolvido em React + TypeScript com backend Node.js/Express e banco de dados PostgreSQL. **100% integrado com banco de dados real** - sem dados mockados.

## 📋 Funcionalidades

Todos os módulos estão totalmente integrados com a API e persistem dados no PostgreSQL:

- **Dashboard** - Visão geral com KPIs reais, alertas e agenda de manutenções
- **Veículos** - CRUD completo com documentação, status e quilometragem
- **Motoristas** - Gestão de motoristas com controle de CNH e validações
- **Viagens** - Agendamento, checklist de saída e finalização
  - Classificação de viagens (curta/longa)
  - Checklist obrigatório antes de iniciar
- **Diário de Bordo** - Controle de despesas em viagens longas
  - Registro de pedágios, alimentação, hospedagem
  - Análise de custos por viagem
- **Abastecimentos** - Registro com cálculo automático de consumo e estatísticas
- **Manutenções** - Preventivas e corretivas com fluxo completo (agendar → iniciar → concluir)
- **Ocorrências** - Multas e sinistros com workflow de resolução
- **Relatórios** - Estatísticas dinâmicas do período selecionado
- **Auditoria** - Log completo de todas as ações do sistema
- **Configurações** - Gestão de usuários com perfis de acesso
  - Vinculação de usuários com motoristas

## 🛠️ Stack Tecnológica

### Frontend
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Lucide Icons
- TanStack Query, React Hook Form
- Recharts para gráficos

### Backend
- Node.js, Express
- PostgreSQL 15
- JWT para autenticação
- bcrypt para hash de senhas

### Infraestrutura
- Docker, Docker Compose
- Nginx para proxy reverso
- Scripts de backup/restore

## 📦 Requisitos

- Node.js 18+ e npm 9+
- Docker 20.10+ e Docker Compose 2.0+ (para produção)
- PostgreSQL 15+ (se rodar sem Docker)

## 🚀 Instalação Local (Desenvolvimento)

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/joelini-fleetflow.git
cd joelini-fleetflow

# 2. Instalar dependências do frontend
npm install

# 3. Instalar dependências do backend
cd backend && npm install && cd ..

# 4. Iniciar banco de dados (Docker)
docker compose up -d db

# 5. Iniciar backend
cd backend && npm run dev &

# 6. Iniciar frontend
npm run dev
```

Frontend: http://localhost:8080
Backend API: http://localhost:3006

## 🐳 Deploy com Docker (Produção)

### Portas Utilizadas

| Serviço | Porta Interna | Porta Externa |
|---------|---------------|---------------|
| PostgreSQL | 5432 | **5434** |
| API Backend | 3006 | **3006** |
| Frontend | 80 | **3007** |

> ⚠️ As portas foram configuradas para evitar conflitos com serviços existentes.

### Passo a Passo

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com suas credenciais

# 2. Build e start
docker compose up -d --build

# 3. Verificar status
docker compose ps
```

Acesse: http://localhost:3007

> 📖 Veja o guia completo em [DEPLOY.md](./DEPLOY.md)

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `POSTGRES_USER` | Usuário do banco | `joelini` |
| `POSTGRES_PASSWORD` | Senha do banco | `joelini2024` |
| `POSTGRES_DB` | Nome do banco | `frota_joelini` |
| `POSTGRES_PORT` | Porta externa do PostgreSQL | `5434` |
| `JWT_SECRET` | Chave para tokens JWT | - |
| `API_PORT` | Porta da API Backend | `3006` |
| `APP_PORT` | Porta do Frontend | `3007` |
| `VITE_API_URL` | URL da API | `http://localhost:3006/api` |

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor dev (porta 8080)
npm run build        # Build de produção
npm run preview      # Preview do build local

# Backend
cd backend
npm run dev          # Iniciar backend em modo dev
npm start            # Iniciar backend em produção

# Docker
docker compose up -d           # Iniciar containers
docker compose down            # Parar containers
docker compose logs -f app     # Ver logs da aplicação
docker compose logs -f api     # Ver logs da API
docker compose logs -f db      # Ver logs do banco

# Backup (produção)
./scripts/backup.sh            # Criar backup do banco
./scripts/restore.sh <arquivo> # Restaurar backup
```

## 🗄️ Estrutura do Banco de Dados

```
├── roles               # Perfis de acesso
├── users               # Usuários do sistema (com vinculação a motorista)
├── vehicles            # Veículos da frota
├── drivers             # Motoristas
├── trips               # Viagens (com tipo curta/longa)
├── checklists          # Checklists de viagem
├── fuelings            # Abastecimentos
├── maintenances        # Manutenções
├── travel_log_expenses # Diário de Bordo (despesas de viagem longa)
├── incidents           # Ocorrências (multas/sinistros)
├── audit_logs          # Log de auditoria
├── notifications       # Notificações
└── settings            # Configurações do sistema
```

## 👤 Usuário Padrão

- **Email**: admin@joelini.com.br
- **Senha**: joelini123

> ⚠️ Altere a senha após o primeiro acesso!

### Perfis de Acesso

| Perfil | Descrição |
|--------|-----------|
| `admin` | Acesso total ao sistema |
| `gestor_frota` | Relatórios, aprovações e gestão |
| `planejamento` | Agendamentos e relatórios |
| `operacional` | Cadastros e registros |
| `motorista` | Apenas suas próprias viagens |

## 📁 Estrutura do Projeto

```
joelini-fleetflow/
├── src/
│   ├── assets/          # Imagens e recursos
│   ├── components/      # Componentes React
│   │   ├── dashboard/   # Componentes do dashboard
│   │   ├── layout/      # Layout principal
│   │   ├── notifications/ # Dropdown de notificações
│   │   ├── profile/     # Modal de perfil
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # Contextos React (Auth)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários e API client
│   └── pages/           # Páginas da aplicação
├── backend/
│   └── src/
│       ├── config/      # Configuração do banco
│       ├── middleware/  # Middlewares (auth, roles)
│       └── routes/      # Rotas da API
├── database/
│   └── init/            # Scripts SQL de inicialização
│       ├── 00_migrations.sql
│       ├── 01_schema.sql
│       └── 02_seed.sql
├── scripts/             # Scripts de backup/restore
├── docker-compose.yml   # Configuração Docker
├── Dockerfile           # Build da aplicação frontend
├── nginx.conf           # Configuração Nginx
└── .env.example         # Variáveis de ambiente
```

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação via JWT
- ✅ Logs de auditoria completos
- ✅ Controle de acesso por perfil (RBAC)
- ✅ Backup automático configurável
- ✅ Validação de entrada em todas as rotas

## 🔄 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/password` - Alterar senha

### Recursos (CRUD completo)
- `/api/vehicles` - Veículos
- `/api/drivers` - Motoristas
- `/api/trips` - Viagens
- `/api/fuelings` - Abastecimentos
- `/api/maintenances` - Manutenções
- `/api/incidents` - Ocorrências
- `/api/users` - Usuários
- `/api/audit` - Logs de auditoria
- `/api/settings` - Configurações

## 🔧 Troubleshooting

### Portas em uso
Se alguma porta estiver em uso, edite o `docker-compose.yml`:
```yaml
ports:
  - "NOVA_PORTA:PORTA_INTERNA"
```

### Verificar logs
```bash
docker compose logs -f
```

### Resetar ambiente
```bash
docker compose down -v
docker compose up -d --build
```

### Problemas de login
O backend automaticamente verifica e corrige hashes de senha inválidos na inicialização.

## 📞 Suporte

- **Documentação**: [DEPLOY.md](./DEPLOY.md)
- **Issues**: GitHub Issues

## 📄 Licença

Este projeto é proprietário da Joelini Transportes.
