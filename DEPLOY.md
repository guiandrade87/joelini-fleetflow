# 🚀 Guia de Deploy - Sistema de Gestão de Frota Joelini

## Pré-requisitos

- Ubuntu 20.04+ ou Debian 11+
- Docker 20.10+ e Docker Compose 2.0+
- Git
- 2GB RAM mínimo
- 10GB espaço em disco

## Passo a Passo

### 1. Instalar Docker (se não tiver)

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker compose version
```

### 2. Clonar o Repositório

```bash
# Clonar do GitHub
git clone https://github.com/SEU_USUARIO/joelini-frota.git
cd joelini-frota
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

**Edite o arquivo `.env`:**
```env
POSTGRES_USER=joelini
POSTGRES_PASSWORD=SENHA_SEGURA_AQUI
POSTGRES_DB=frota_joelini
JWT_SECRET=GERAR_CHAVE_SECRETA_LONGA
```

> ⚠️ **IMPORTANTE**: Troque as senhas padrão por senhas seguras!

### 4. Subir os Containers

```bash
# Build e start em background
docker compose up -d --build

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

### 5. Verificar se está funcionando

```bash
# Testar conexão com o banco
docker compose exec db psql -U joelini -d frota_joelini -c "SELECT COUNT(*) FROM vehicles;"

# Acessar no navegador
# http://SEU_IP:3000
```

## 🔧 Comandos Úteis

### Gerenciamento

```bash
# Parar containers
docker compose down

# Reiniciar
docker compose restart

# Ver logs em tempo real
docker compose logs -f app

# Acessar shell do container
docker compose exec app sh
docker compose exec db psql -U joelini -d frota_joelini
```

### Backup

```bash
# Dar permissão aos scripts
chmod +x scripts/backup.sh scripts/restore.sh

# Criar diretório de backups
sudo mkdir -p /var/backups/joelini-frota
sudo chown $USER:$USER /var/backups/joelini-frota

# Executar backup manual
./scripts/backup.sh

# Agendar backup diário (crontab)
crontab -e
# Adicionar linha:
0 2 * * * /caminho/para/projeto/scripts/backup.sh >> /var/log/joelini-backup.log 2>&1
```

### Restore

```bash
# Listar backups disponíveis
ls -la /var/backups/joelini-frota/

# Restaurar backup específico
./scripts/restore.sh /var/backups/joelini-frota/frota_joelini_20241212_020000.sql.gz
```

## 🔐 Segurança

### Configurar Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # Aplicação
sudo ufw enable
```

### HTTPS com Nginx (Recomendado)

```bash
# Instalar Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/joelini-frota
```

```nginx
server {
    listen 80;
    server_name frota.joelini.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/joelini-frota /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Gerar certificado SSL
sudo certbot --nginx -d frota.joelini.com.br
```

## 📊 Monitoramento

### Ver uso de recursos

```bash
# Status dos containers
docker stats

# Espaço em disco
df -h
docker system df
```

### Limpar recursos não utilizados

```bash
# Remover imagens e containers não usados
docker system prune -a
```

## 🆘 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs --tail=100 app
docker compose logs --tail=100 db

# Verificar se porta está em uso
sudo lsof -i :3000
sudo lsof -i :5432
```

### Banco não conecta

```bash
# Verificar se container do banco está rodando
docker compose ps db

# Testar conexão
docker compose exec db pg_isready -U joelini

# Recriar banco (PERDE DADOS!)
docker compose down -v
docker compose up -d
```

### Resetar tudo

```bash
# Parar e remover containers, volumes e imagens
docker compose down -v --rmi all

# Subir novamente do zero
docker compose up -d --build
```

## 📞 Suporte

- **Documentação**: README.md
- **Logs**: `docker compose logs -f`
- **Email**: suporte@joelini.com.br
