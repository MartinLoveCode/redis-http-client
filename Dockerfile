# Start from a base image with Node.js
FROM node:18-alpine

WORKDIR /usr/app
COPY . .
RUN npm install


RUN apk add --no-cache redis

RUN chmod +x start.sh


EXPOSE 8080

CMD ["./start.sh"]
