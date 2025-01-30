######### First Stage #############

FROM node:20-alpine AS development

WORKDIR /app

COPY --chown=node:node ./ ./

RUN npm ci \
    && npx prisma generate \
    && npm run build \
    && npm prune --omit=dev


######### Second Stage #############

FROM node:20-alpine AS production

WORKDIR /var/www/app

# Create the necessary directories with correct permissions
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/dist ./dist
COPY --chown=node:node --from=development /app/package*.json ./

# Switch to the non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]