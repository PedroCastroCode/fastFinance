FROM node:20-alpine as builder

WORKDIR /usr/src/node-api
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -la && cat tsconfig.json
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/node-api
COPY --from=builder /usr/src/node-api/node_modules ./node_modules
COPY --from=builder /usr/src/node-api/dist ./dist

EXPOSE 3333

CMD ["node", "dist/main"]