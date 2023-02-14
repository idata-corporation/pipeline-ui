FROM node:10 as build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
RUN npm install react-scripts@3.4.1 -g --silent && npm install
COPY . ./
RUN npm run build:docker

# production environment
FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY 40-create-react-env.sh /docker-entrypoint.d/40-create-react-env.sh
RUN chmod +x /docker-entrypoint.d/40-create-react-env.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
