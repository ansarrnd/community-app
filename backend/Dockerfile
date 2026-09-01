FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /api ./cmd/api

FROM alpine:3.20
RUN adduser -D -H app
USER app
WORKDIR /home/app
COPY --from=build /api /api
EXPOSE 8088
ENV HTTP_ADDR=0.0.0.0:8088
ENV DATABASE_URL=file:/home/app/community.db?_pragma=busy_timeout(5000)&_pragma=foreign_keys(1)
ENTRYPOINT ["/api"]
