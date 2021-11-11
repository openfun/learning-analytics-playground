// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
const Graylog = require("./graylog");
const utils = require("./utils");

Cypress.Commands.add("lmsLogin", (email, password) => {
  cy.visit("http://edx_lms:8000/login");
  cy.get("input#email").type(email);
  cy.get("div:nth-child(4) > input[name=password]").type(password);
  cy.get("form > button#submit").click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("lmsLogout", () => {
  cy.visit("http://edx_lms:8000/");
  cy.get("body > #top-menu > .right-header > .toggle-dropdown-menu").click();
  cy.get(
    "#top-menu > .right-header > .fun-dropdown-menu > li:nth-child(3) > a"
  ).click();
});

Cypress.Commands.add("cmsLogin", (email, password) => {
  cy.request({ method: "GET", url: "http://edx_cms:8000/signin" }).then(
    (response) => {
      const cookie = response.headers["set-cookie"][0].substring(10, 42);
      return cy
        .request({
          method: "POST",
          url: "http://edx_cms:8000/login_post",
          headers: { "X-CSRFToken": cookie, Cookie: `csrftoken=${cookie}` },
          form: true,
          body: { email, password, honor_code: true },
        })
        .then((response2) => {
          expect(response2.status).to.equal(200);
          return { cookie, response2 };
        });
    }
  );
});

Cypress.Commands.add("lmsEnroll", (enroll = true) => {
  return cy
    .getCookie("csrftoken")
    .should("exist")
    .then((cookie) => {
      return cy.request({
        method: "POST",
        url: "http://edx_lms:8000/change_enrollment",
        form: true,
        headers: {
          "X-CSRFToken": cookie.value,
        },
        body: {
          course_id: "course-v1:organisation+numero_du_cours+course",
          enrollment_action: enroll ? "enroll" : "unenroll",
        },
      });
    })
    .then((response) => {
      expect(response.status).to.equal(200);
      cy.visit("http://edx_lms:8000/dashboard");
      cy.get("#my-courses").should(
        enroll ? "contain" : "not.contain",
        "nom_du_cours"
      );
    });
});

Cypress.Commands.add("graylogPartialMatch", (partialEvent) => {
  let isMatch = false;
  const graylog = new Graylog(Cypress.env());
  cy.request({
    method: "POST",
    url: `http://graylog:9000/api/views/search/${graylog.searchId}/execute`,
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
