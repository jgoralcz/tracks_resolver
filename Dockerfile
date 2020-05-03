# docker stop track_resolver || true && docker rm track_resolver || true && docker run -d -p 9443:9443 --restart always --memory="1024m" --cpu-shares=1024 --name track_resolver track_resolver
# docker build -t track_resolver . && docker stop track_resolver || true && docker rm track_resolver || true && docker run -d --restart=always --network=bridge --memory="1024m" --cpu-shares=1024 --name track_resolver track_resolver
FROM node:latest

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Metadata Track Resolver"

ENV NODE_ENV=PROD

# get different garbage collector
RUN apt-get update && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*

# Change memory allocator to avoid leaks
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

COPY --chown=node:node config.json /usr/src/node/
COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

WORKDIR /usr/src/node

EXPOSE 9443

USER node

RUN npm install

CMD ["npm", "start"]
