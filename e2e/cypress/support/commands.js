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

const adminEmail = Cypress.env("EDX_ADMIN_EMAIL");
const adminPass = Cypress.env("EDX_ADMIN_PASSWORD");
const studentEmail = Cypress.env("EDX_STUDENT_EMAIL");
const studentPass = Cypress.env("EDX_STUDENT_PASSWORD");

const login = (email, password, url) => {
  const method = "POST";
  const form = true;
  const body = { email, password, honor_code: true };
  return cy.request({ url, method, form, body }).then((response) => {
    expect(response.status).to.equal(200);
    return response;
  });
};

const cmsLogin = (email, password) =>
  login(email, password, `${Cypress.env("EDX_CMS_URL")}/login_post`);

const lmsLogin = (email, password) => login(email, password, "/login_ajax");

Cypress.Commands.add("cmsLogin", cmsLogin);
Cypress.Commands.add("lmsLogin", lmsLogin);
Cypress.Commands.add("cmsLoginAdmin", () => cmsLogin(adminEmail, adminPass));
Cypress.Commands.add("lmsLoginAdmin", () => lmsLogin(adminEmail, adminPass));
Cypress.Commands.add("lmsLoginStudent", () =>
  lmsLogin(studentEmail, studentPass)
);

Cypress.Commands.add("lmsEnroll", (enroll, course = null) => {
  const { courseId } = course || Cypress.env("EDX_COURSES").demoCourse1;
  const enrollmentAction = enroll ? "enroll" : "unenroll";
  return cy
    .request({
      method: "POST",
      url: "/change_enrollment",
      form: true,
      body: { course_id: courseId, enrollment_action: enrollmentAction },
    })
    .then((response) => expect(response.status).to.equal(200));
});

Cypress.Commands.add("graylogPartialMatch", (partialEvent) => {
  let isMatch = false;
  const env = Cypress.env();
  const graylog = new Graylog(env);
  // EdX writes logs to graylog asynchronously.
  // Therefore we wait a bit to get the results.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
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
