FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV production

RUN mkdir -p /usr/src/app/logs

VOLUME /usr/src/app/logs

CMD [ "node", "main.js" ]
