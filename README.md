# 🚛 Joelini FleetFlow

Sistema completo de Gestão de Frota desenvolvido em React + TypeScript para controle de veículos, motoristas, viagens, abastecimentos e manutenções.

## 📋 Funcionalidades

- **Dashboard** - Visão geral com KPIs, alertas e agenda de manutenções
- **Veículos** - Cadastro completo com documentação, seguros e histórico
- **Motoristas** - Gestão de motoristas com controle de CNH e habilitação
- **Viagens** - Agendamento, checklist de saída/retorno e rastreamento
- **Abastecimentos** - Registro de abastecimentos com cálculo de consumo
- **Manutenções** - Preventivas e corretivas com agendamento
- **Ocorrências** - Multas, sinistros e avarias
- **Termos de Aceite** - Termos digitais com assinatura
- **Relatórios** - Exportação em CSV/PDF
- **Auditoria** - Log completo de ações do sistema
- **Configurações** - Personalização do sistema

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Estado**: TanStack Query, React Hook Form
- **Gráficos**: Recharts
- **Backend**: PostgreSQL 15
- **Deploy**: Docker, Nginx

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

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com suas credenciais

# 2. Build e start
docker compose up -d --build

# 3. Verificar status
docker compose ps
```

Acesse: http://localhost:3000

> 📖 Veja o guia completo em [DEPLOY.md](./DEPLOY.md)

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `POSTGRES_USER` | Usuário do banco | `joelini` |
| `POSTGRES_PASSWORD` | Senha do banco | `senha_segura` |
| `POSTGRES_DB` | Nome do banco | `frota_joelini` |
| `JWT_SECRET` | Chave para tokens JWT | `chave_secreta_longa` |
| `VITE_API_URL` | URL da API backend | `http://localhost:5000` |

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

# Backup (produção)
./scripts/backup.sh            # Criar backup do banco
./scripts/restore.sh <arquivo> # Restaurar backup
```

## 🗄️ Estrutura do Banco de Dados

```
├── roles          # Perfis de acesso
├── users          # Usuários do sistema
├── vehicles       # Veículos da frota
├── drivers        # Motoristas
├── trips          # Viagens
├── checklists     # Checklists de viagem
├── fuelings       # Abastecimentos
├── maintenances   # Manutenções
├── incidents      # Ocorrências (multas/sinistros)
├── acceptances    # Termos de aceite
├── audit_logs     # Log de auditoria
├── notifications  # Notificações
└── settings       # Configurações
```

## 👤 Usuário Padrão

- **Email**: admin@joelini.com.br
- **Senha**: joelini123

> ⚠️ Altere a senha após o primeiro acesso!

## 📁 Estrutura do Projeto

```
joelini-fleetflow/
├── src/
│   ├── assets/          # Imagens e recursos
│   ├── components/      # Componentes React
│   │   ├── dashboard/   # Componentes do dashboard
│   │   ├── layout/      # Layout principal
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários
│   └── pages/           # Páginas da aplicação
├── database/
│   └── init/            # Scripts SQL de inicialização
├── scripts/             # Scripts de backup/restore
├── docker-compose.yml   # Configuração Docker
├── Dockerfile           # Build da aplicação
└── nginx.conf           # Configuração Nginx
```

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- Autenticação via JWT
- Logs de auditoria completos
- Backup automático configurável

## 📞 Suporte

- **Documentação**: [DEPLOY.md](./DEPLOY.md)
- **Issues**: GitHub Issues

## 📄 Licença

Este projeto é proprietário da Joelini Transportes.
