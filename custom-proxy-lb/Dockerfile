FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
EXPOSE 9090

CMD ["node", "src/server.js"] 