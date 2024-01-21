ARG node_version=18
ARG node_image=node:${node_version}

# STAGE 1: builder
FROM $node_image AS builder

COPY . /app/
WORKDIR /app

ENV NODE_ENV=development

# install (dev) deps
# on GitHub runners, timeouts occur in emulated containers
RUN yarn --network-timeout 300000

ENV NODE_ENV=production
# build (prod) app
RUN yarn build

FROM golang:1.21.6-alpine As build-stage
WORKDIR /app
COPY transferQuery/go.mod transferQuery/go.sum ./
RUN go mod download
COPY transferQuery/main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /transfer-query

FROM nginx:alpine AS production
WORKDIR /
COPY --from=build-stage /transfer-query /transfer-query
EXPOSE 8080
CMD ["/transfer-query"]
COPY --from=builder /app/build/ /usr/share/nginx/html/

