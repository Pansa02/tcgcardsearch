# syntax=docker/dockerfile:1

FROM node:lts-slim as build
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
RUN npm run build

FROM node:lts-slim
EXPOSE 3000
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm -g install serve
USER node
CMD ["serve", "-s", "build"]