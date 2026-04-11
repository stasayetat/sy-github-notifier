# *** BASE **************************************************************
FROM node:22-slim AS base
WORKDIR /opt/app/

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10 --activate

# *** BUILDER **************************************************************
FROM base AS builder

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# *** PRODUCTION **************************************************************
FROM node:22-slim AS production
WORKDIR /opt/app/

COPY package.json .npmrc ./
COPY --from=builder /opt/app/node_modules node_modules
COPY --from=builder /opt/app/.build .build
COPY --from=builder /opt/app/migrations migrations
COPY --from=builder /opt/app/tsconfig.json tsconfig.json

USER node

CMD ["node", ".build/main.js"]
