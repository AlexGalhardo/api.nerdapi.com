FROM node:latest
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY . .
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm", "run", "dev"]
