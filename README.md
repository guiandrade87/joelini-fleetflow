# 🚛 Joelini FleetFlow

Sistema completo de Gestão de Frota desenvolvido em React + TypeScript para controle de veículos, motoristas, viagens, abastecimentos e manutenções.

## 📋 Funcionalidades

- **Dashboard** - Visão geral com KPIs, alertas e agenda de manutenções
- **Veículos** - Cadastro completo com documentação, seguros e histórico
- **Motoristas** - Gestão de motoristas com controle de CNH e habilitação
- **Viagens** - Agendamento, checklist de saída/retorno e rastreamento
  - Classificação de viagens (curta/longa)
  - Checklist obrigatório antes de iniciar
- **Diário de Bordo** - Controle de despesas em viagens longas
  - Vinculação obrigatória com abastecimentos e manutenções
  - Registro de pedágios, alimentação, hospedagem
  - Análise de custos por viagem
- **Abastecimentos** - Registro de abastecimentos com cálculo de consumo
- **Manutenções** - Preventivas e corretivas com agendamento
- **Ocorrências** - Multas, sinistros e avarias
- **Termos de Aceite** - Termos digitais com assinatura (CRUD completo)
- **Relatórios** - Exportação em CSV/PDF
- **Auditoria** - Log completo de ações do sistema
- **Configurações** - Personalização do sistema e gestão de usuários
  - Vinculação de usuários com motoristas

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Estado**: TanStack Query, React Hook Form
- **Gráficos**: Recharts
- **Backend**: Node.js, Express, PostgreSQL 15
- **Deploy**: Docker, Docker Compose, Nginx

## 📦 Requisitos

- Node.js 18+ e npm 9+
- Docker 20.10+ e Docker Compose 2.0+ (para produção)
- PostgreSQL 15+ (se rodar sem Docker)

## 🚀 Instalação Local (Desenvolvimento)

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/joelini-fleetflow.git
cd joelini-fleetflow

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:8080

## 🐳 Deploy com Docker (Produção)

### Portas Utilizadas

| Serviço | Porta Interna | Porta Externa |
|---------|---------------|---------------|
| PostgreSQL | 5432 | **5434** |
| API Backend | 3006 | **3006** |
| Frontend | 80 | **3007** |

> ⚠️ As portas foram configuradas para evitar conflitos com serviços existentes (3000-3005 e 5432-5433).

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

# Linting
npm run lint         # Verificar código

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
├── roles               # Perfis de acesso (admin, gestor_frota, planejamento, operacional, motorista)
├── users               # Usuários do sistema (com vinculação a motorista)
├── vehicles            # Veículos da frota
├── drivers             # Motoristas
├── trips               # Viagens (com tipo curta/longa)
├── checklists          # Checklists de viagem
├── fuelings            # Abastecimentos
├── maintenances        # Manutenções
├── travel_log_expenses # Diário de Bordo (despesas de viagem longa)
├── incidents           # Ocorrências (multas/sinistros)
├── terms               # Termos cadastrados
├── acceptances         # Aceites de termos
├── audit_logs          # Log de auditoria
├── notifications       # Notificações
└── settings            # Configurações
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
│   ├── lib/             # Utilitários e API
│   └── pages/           # Páginas da aplicação
├── backend/
│   └── src/
│       ├── config/      # Configuração do banco
│       ├── middleware/  # Middlewares (auth)
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

- Senhas hasheadas com bcrypt
- Autenticação via JWT
- Logs de auditoria completos
- Backup automático configurável
- Controle de acesso por perfil

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

## 📞 Suporte

- **Documentação**: [DEPLOY.md](./DEPLOY.md)
- **Issues**: GitHub Issues

## 📄 Licença

Este projeto é proprietário da Joelini Transportes.
