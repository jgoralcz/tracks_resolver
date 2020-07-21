# docker stop track_resolver || true && docker rm track_resolver || true && docker run -d -p 9443:9443 --restart always --memory="1024m" --cpu-shares=1024 --name track_resolver track_resolver
# docker build -t track_resolver . && docker stop track_resolver || true && docker rm track_resolver || true && docker run -d --restart=always --network=bridge --memory="1024m" --cpu-shares=1024 --name track_resolver track_resolver
FROM node:current-alpine3.11

LABEL owner = jgoralcz
LABEL serviceVersion = 2.0.0
LABEL description = "Metadata Track Resolver"

WORKDIR /usr/node

COPY --chown=node:node package*.json /usr/node/
COPY --chown=node:node src/ /usr/node/src/
RUN mkdir -p /usr/node/logs && chown node:node /usr/node/logs

RUN npm install

EXPOSE 8443

USER node

CMD ["npm", "start"]
