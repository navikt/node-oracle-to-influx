FROM tulip/node-oracle-base:2.0
RUN npm install -g n && n lts
RUN node -v
RUN yarn --version

WORKDIR /usr/src/app

COPY . .

EXPOSE 8082
RUN yarn install
CMD node ./tests/utils/server.js
