ARG VERSION=1.30.6-alpine
FROM nginx:${VERSION}
COPY /App /usr/share/nginx/html
LABEL version=$VERSION
EXPOSE 80
