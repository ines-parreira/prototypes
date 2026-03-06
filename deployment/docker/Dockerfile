FROM node:22-alpine AS build


ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY . .

RUN --mount=type=secret,id=NPM_TOKEN,env=NPM_TOKEN \
    echo "@gorgias:registry=https://npm.pkg.github.com" >> .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc && \
    pnpm install --frozen-lockfile && \
    rm -f .npmrc

RUN NO_CONTENT_HASH=1 pnpm build

FROM nginx

COPY --from=build /app/apps/helpdesk/build /usr/share/nginx/html/

RUN mkdir -p /usr/share/nginx/html/static/public
RUN ln -s /usr/share/nginx/html/helpdesk.shared-worker.js /usr/share/nginx/html/static/public/helpdesk.shared-worker.js
RUN ln -s /usr/share/nginx/html/pubnub.worker.js /usr/share/nginx/html/static/public/pubnub.worker.js

ARG RELEASE
ENV RELEASE=${RELEASE}

EXPOSE 80
