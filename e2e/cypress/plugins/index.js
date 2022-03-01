const EdxCms = require("../support/edx_cms");
const Graylog = require("../support/graylog");
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// eslint-disable-next-line no-unused-vars
module.exports = async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const graylog = new Graylog(config.env);
  await graylog.initializeInput();
  const coursesConfig = config.env.EDX_COURSES_CONFIG;
  try {
    config.env.EDX_COURSES = require(`../../${coursesConfig}.json`);
  } catch {
    const edxCms = new EdxCms(config.env);
    await edxCms.seedCourses();
    config.env.EDX_COURSES = require(`../../${coursesConfig}.json`);
  }
  return config;
};
