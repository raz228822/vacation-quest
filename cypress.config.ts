import { defineConfig } from "cypress";

export default defineConfig({
  watchForFileChanges:false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalStudio: true,
    defaultCommandTimeout: 30000,
    requestTimeout: 20000,
  },
});
