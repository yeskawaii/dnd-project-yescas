# Usamos una versión ligera de Node
FROM node:20-slim

# Directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de dependencias primero para optimizar cache
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa tu servidor (el 4000)
EXPOSE 4000

# Comando para arrancar
CMD ["node", "index.js"]