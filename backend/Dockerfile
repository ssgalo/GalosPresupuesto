# Usar una imagen oficial de Node.js
FROM node:18-alpine

# Crear y definir el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que corre la app
EXPOSE 3001

# Comando para iniciar el servidor
CMD [ "node", "src/index.js" ] # Ajusta esto a tu archivo de inicio