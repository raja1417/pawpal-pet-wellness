FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN ./node_modules/.bin/prisma generate
COPY tsconfig*.json .eslintrc.json ./
COPY src ./src
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM development AS build
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S pawpal && adduser -S -G pawpal pawpal
COPY --from=build --chown=pawpal:pawpal /app/node_modules ./node_modules
COPY --from=build --chown=pawpal:pawpal /app/dist ./dist
COPY --from=build --chown=pawpal:pawpal /app/prisma ./prisma
COPY --from=build --chown=pawpal:pawpal /app/package.json ./
USER pawpal
EXPOSE 3000
CMD ["node", "dist/src/index.js"]
