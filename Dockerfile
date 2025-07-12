FROM node:18-alpine

RUN apk add --no-cache ffmpeg python3 py3-pip curl

RUN pip3 install --break-system-packages yt-dlp

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install tsx --global

COPY . .

CMD ["npm", "run", "start"]