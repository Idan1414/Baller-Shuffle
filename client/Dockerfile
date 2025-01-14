FROM ubuntu:latest
# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs
# Set npm version
RUN npm install -g npm@9.5.1
# Create app directory
WORKDIR /usr/src/app
# Copy package files
COPY ./package*.json ./
# Install dependencies
RUN npm install
RUN npm install react-scripts --save-dev
# Copy app source
COPY ./ .
RUN npx update-browserslist-db@latest
# Build app
RUN npm run build
# Expose port
EXPOSE 3000
# Start app with the development server
ENV WDS_SOCKET_PORT=0
CMD ["npm", "start"]