FROM --platform=linux/amd64 registry.redhat.io/ubi9/nodejs-24@sha256:f417d3754ec1c84af75c9457ac264c2ff3a0db2e3ad67581bdda49d95a6347eb AS builder
USER 1001
WORKDIR ${APP_ROOT}/repo
COPY --chown=1001:0 . .
RUN node .yarn/releases/yarn-4.12.0.cjs install --immutable && node .yarn/releases/yarn-4.12.0.cjs build:all

FROM --platform=linux/amd64 scratch
COPY --from=builder /opt/app-root/repo/apps/agent-ui/dist /apps/agent-ui/dist
