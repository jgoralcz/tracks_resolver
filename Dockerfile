
FROM node:current-alpine3.11

LABEL owner = jgoralcz
LABEL serviceVersion = 2.0.0
LABEL description = "Metadata Track Resolver"

WORKDIR /usr/node

COPY --chown=node:node package*.json /usr/node/
COPY --chown=node:node src/ /usr/node/src/

RUN npm install --production=true

EXPOSE 8443

USER node

CMD ["npm", "start"]
