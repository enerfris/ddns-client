FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm cache clean --force && npm install -g npm@latest

RUN npm set audit false

RUN npm ci --only=production --loglevel verbose

COPY . .

ENV NODE_ENV production

RUN mkdir -p /usr/src/app/logs

VOLUME /usr/src/app/logs

CMD [ "node", "main.js" ]
