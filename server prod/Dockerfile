# Backend Dockerfile
FROM ubuntu:latest

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Verify Node.js version
# RUN node --version | grep -q "^v18.16.0"

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY ./ .

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]