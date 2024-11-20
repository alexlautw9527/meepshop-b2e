FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN rm -f ./prisma/test.db

COPY . .

RUN npx prisma generate

EXPOSE 8000

CMD ["npm", "run", "dev"]