FROM alpine:3.18.4

EXPOSE 8080
ENV TZ=Europe/Berlin

LABEL autoheal true
HEALTHCHECK --start-period=30s --interval=10s CMD curl -f "http://localhost:8080/rest/bookmarks/tags" || exit 1

RUN apk --no-cache add tzdata ca-certificates curl && update-ca-certificates
COPY bookmarks /

WORKDIR /
ENTRYPOINT ["/bookmarks"]
