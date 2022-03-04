// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const Graylog = require("./graylog");
const utils = require("./utils");

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("graylogPartialMatch", (partialEvent) => {
  let isMatch = false;
  const env = Cypress.env();
  const graylog = new Graylog(env);
  // EdX writes logs to graylog asynchronously.
  // Therefore we wait a bit to get the results.
  cy.wait(100);
  cy.request({
    method: "POST",
    url: `${env.GRAYLOG_URL}/api/views/search/${graylog.searchId}/execute`,
    headers: graylog.commonOptions.headers,
  }).then((response) => {
    const result = response.body.results[graylog.searchId];
    const { messages } = result.search_types[graylog.searchTypeId];
    const debugEvents = [];
    for (let i = 0; i < messages.length; i++) {
      let event = null;
      try {
        const message = messages[i].message.msg;
        event = JSON.parse(message);
        debugEvents.push(message);
      } catch (e) {
        // eslint-disable-next-line no-continue
        continue; // We ignore events that are not valid JSON.
      }
      if (event && utils.isSubset(event, partialEvent)) {
        isMatch = true;
        break;
      }
    }
    if (!isMatch) {
      const msg = `${JSON.stringify(partialEvent)} did not match any event in:`;
      throw new Error(`${msg} \n${debugEvents.join("\n")}`);
    }
  });
});
