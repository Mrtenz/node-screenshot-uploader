FROM node:8.11-alpine

WORKDIR /tmp
COPY package.json yarn.lock ./
RUN yarn install

WORKDIR /usr/src/app
COPY . .
RUN cp -a /tmp/node_modules /usr/src/app/

CMD ["yarn", "run", "start"]
