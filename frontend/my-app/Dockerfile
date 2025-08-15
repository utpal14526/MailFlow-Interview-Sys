# Use Node for build
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Accept the API URL from build args
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY . .

# Build React app with the env variable
RUN npm run build

# Production stage using serve
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./
CMD ["serve", "-s", ".", "-l", "80"]
