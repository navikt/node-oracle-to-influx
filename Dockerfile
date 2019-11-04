FROM pipekung/node-oracle:latest
RUN npm install -g n && n lts
RUN node -v
RUN yarn --version

WORKDIR /usr/src/app

COPY . .

EXPOSE 8082
# At the end, set the user to use when running this image
RUN yarn install
CMD node ./tests/utils/server.js
