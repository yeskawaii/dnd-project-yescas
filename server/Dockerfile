# Usamos una versión ligera de Node
FROM node:20-slim

# Directorio de trabajo
WORKDIR /app

# INSTALAMOS CURL (Vital para el Healthcheck)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copiamos solo los archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto 4001 (el que configuramos en index.js)
EXPOSE 4001

# Comando para arrancar
CMD ["node", "index.js"]