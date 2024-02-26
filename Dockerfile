FROM node:20-alpine

COPY . /
RUN npm i && npm run build
CMD ["npm", "run", "start:prod"]

EXPOSE 3000