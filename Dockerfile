# Use Puppeteer base image with Chromium pre-installed
FROM ghcr.io/puppeteer/puppeteer:20.5.0

# Avoid spaces around `=` in ENV or they won't be respected
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set working directory
WORKDIR /usr/src/app

# Copy and install only dependencies first (faster layer caching)
COPY package*.json ./
RUN npm ci

# Copy all other files
COPY . .

# Expose the port (optional but recommended)
EXPOSE 3000

# Start the app
CMD ["node", "utils/index.js"]
