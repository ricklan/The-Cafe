FROM node:10-alpine3.9

WORKDIR /app

COPY package*.json ./

RUN npm i

RUN npm install -g ts-node

COPY . . 

ENV PROD=true
ENV API_PORT=3001
ENV PEERJS_PORT=9000

EXPOSE 3001
EXPOSE 9000

CMD ["ts-node", "app.ts"]