const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',  // your server's port
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
