FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --only=production
COPY . .
ENV NODE_ENV=production
ENV PORT=3030
EXPOSE 3030
CMD ["npm", "start"]