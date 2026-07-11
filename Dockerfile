FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production && \
    mkdir -p /app/nginx-html && \
    if [ -f dist/Edifika/browser/index.html ]; then \
      cp -r dist/Edifika/browser/. /app/nginx-html/; \
    elif [ -f dist/Edifika/index.html ]; then \
      cp -r dist/Edifika/. /app/nginx-html/; \
    else \
      echo "Angular build output with index.html was not found" && \
      find dist -maxdepth 3 -type f -name index.html && \
      exit 1; \
    fi

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/nginx-html/ /usr/share/nginx/html/

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
