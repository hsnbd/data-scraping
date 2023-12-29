# Welcome to G-scraping

## Overview
A web application that will extract large amounts of data from the Google search results page
![image](https://github.com/hsnbd/data-scraping/assets/15382311/ab9a39d2-f10d-4416-a99f-903d4733e595)


## Technology stack
- NestJS for API
- React for Client UI
- Rabbitmq message broker
- Postgresql
- Puppeteer libs for scraping


## Quick setup
Clone project using git
```shell
git clone https://github.com/hsnbd/data-scraping.git
```

Install npm dependency for the workstation. (You can run the project individually too. I just keep it in the workstation for one git repo)
```shell
npm install
```
`N.B run this command in root directory`

copy `packages/nest-api/.env-example` and change as needed.

copy `packages/react-client/.env-example` and change as needed.

Run `postgresql`

Run `rabbitmq`. (You can run it from `docker/rabbitmq/docker-compose.yaml`)

Run Backend NestJS
```shell
npm run start:api
```
Run Scraping Service
```shell
npm run start:scraping
```
Run Frontend React
```shell
npm run start:client
```

- A new user will be created on nestjs bootstrap. (`u: admin@gmail.com, p: password`)
- Swagger API docs URL `/open-api` for backend API
