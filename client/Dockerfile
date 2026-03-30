# PASO 1: Build de la app con Vite
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# PASO 2: Servir con Nginx
FROM nginx:alpine
# Copiamos los archivos generados por Vite a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]