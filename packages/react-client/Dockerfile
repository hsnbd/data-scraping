FROM node:20-alpine as builder

USER node
WORKDIR /app

COPY --chown=node:node package*.json ./
ENV PATH /app/node_modules/.bin:$PATH
RUN npm install

COPY --chown=node:node . .
RUN npm run build

FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder --chown=node:node /app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]