FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD npx prisma migrate deploy && npx ts-node-dev --transpile-only src/server.ts