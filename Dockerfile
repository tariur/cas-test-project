FROM node:22-alpine AS build
WORKDIR /app
COPY package.json *package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/*/browser /usr/share/nginx/html
EXPOSE 8080
ENTRYPOINT [ "nginx", "-c", "nginx.conf" ]
CMD ["-g", "daemon off;"]