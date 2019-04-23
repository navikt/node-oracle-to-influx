FROM collinestes/docker-node-oracle:latest

WORKDIR /usr/src/app

COPY . .

EXPOSE 8081
# At the end, set the user to use when running this image
USER node
CMD node ./tests/utils/server.js
