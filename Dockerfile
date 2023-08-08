FROM node:lts-alpine3.18

WORKDIR /usr/src/app

RUN \
set -eux \
\
## Update Alpine base \
&& apk update \
&& apk upgrade \
--no-cache \
--progress \
--force-refresh

RUN apk add --no-cache --virtual .build-deps \
    ca-certificates \
    wget \
    tar && \
    cd /usr/local/bin && \
    wget https://yarnpkg.com/latest.tar.gz && \
    tar zvxf latest.tar.gz && \
    ln -s /usr/local/bin/dist/bin/yarn.js /usr/local/bin/yarn.js && \
    apk del .build-deps

COPY package*.json ./

RUN yarn install --pure-lockfile

COPY . .

EXPOSE 8080

CMD ["yarn", "watch"]
