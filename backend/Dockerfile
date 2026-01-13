# Backend API Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN npm install --omit=dev

# Copiar código fonte
COPY src ./src

# Criar diretório de uploads
RUN mkdir -p uploads/vehicles uploads/drivers uploads/documents uploads/incidents

# Expor porta
EXPOSE 3003

# Iniciar aplicação
CMD ["node", "src/index.js"]
