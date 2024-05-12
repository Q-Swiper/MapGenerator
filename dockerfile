ARG VERSION=alpine
FROM nginx:${VERSION}
COPY /App /usr/share/nginx/html
LABEL version=$VERSION
EXPOSE 80
