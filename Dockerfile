FROM golang:1-buster AS builder

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /bookmarks .


FROM scratch

LABEL maintainer="blizzy@blizzy.de"

EXPOSE 8080/tcp

COPY templates /templates
COPY --from=builder /bookmarks /

WORKDIR /

ENTRYPOINT ["/bookmarks"]
