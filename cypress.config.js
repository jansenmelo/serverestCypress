const { defineConfig } = require("cypress");

const reporterOptions = {
  charts: true,
  reportPageTitle: 'ServeRest - Report E2E Tests',
  embeddedScreenshots: true,
  inlineAssets: true,
  saveAllAttempts: false,
  reportDir: 'cypress/reports/mochawesome'
};

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 12000,
  pageLoadTimeout: 12000,
  screenshotsFolder: 'cypress/screenshots',
  video: true,

  e2e: {
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: reporterOptions,

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
    },
  },
});
