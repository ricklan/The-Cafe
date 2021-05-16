# pull official base image
FROM node:12 as node

# set working directory
WORKDIR /app

# install app dependencies
COPY package*.json ./

RUN npm i

RUN npm i react-scripts -g
RUN npm i typescript -g
RUN npm i sass -g

# add app
COPY . .

ENV REACT_APP_PROD true

RUN npm run build

FROM nginx
COPY --from=node /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
# start app
CMD ["nginx", "-g", "daemon off;"]
