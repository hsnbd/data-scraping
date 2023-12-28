FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY . .

RUN yarn set version berry
RUN yarn install

# Run the build command which creates the production bundle
RUN yarn build core-api


# Set NODE_ENV environment variable
ENV NODE_ENV production

EXPOSE 4000
# Start the server using the production build
CMD [ "node", "dist/apps/core-api/src/main.js" ]
