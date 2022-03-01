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

const login = (email, password, url) => {
  const method = "POST";
  const form = true;
  const body = { email, password, honor_code: true };
  return cy.request({ url, method, form, body }).then((response) => {
    expect(response.status).to.equal(200);
    return response;
  });
};

const cmsLogin = (email, password) => {
  return login(email, password, `${Cypress.env("EDX_CMS_URL")}/login_post`);
};

const lmsLogin = (email, password) => {
  return login(email, password, "/login_ajax");
};

Cypress.Commands.add("cmsLogin", cmsLogin);

Cypress.Commands.add("cmsLoginAdmin", () => {
  return cmsLogin(
    Cypress.env("EDX_ADMIN_EMAIL"),
    Cypress.env("EDX_ADMIN_PASSWORD")
  );
});

Cypress.Commands.add("lmsLogin", lmsLogin);

Cypress.Commands.add("lmsLoginAdmin", () => {
  return lmsLogin(
    Cypress.env("EDX_ADMIN_EMAIL"),
    Cypress.env("EDX_ADMIN_PASSWORD")
  );
});

Cypress.Commands.add("lmsLoginStudent", () => {
  return lmsLogin(
    Cypress.env("EDX_STUDENT_EMAIL"),
    Cypress.env("EDX_STUDENT_PASSWORD")
  );
});

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
    .then((response) => {
      expect(response.status).to.equal(200);
      return response;
    });
});

Cypress.Commands.add(
  "getSection",
  (sectionName, chapterName = "demoChapter1", courseName = "demoCourse1") => {
    const course = Cypress.env("EDX_COURSES")[courseName];
    return course.chapter[chapterName].chapter.sequential[sectionName];
  }
);

Cypress.Commands.add("graylogPartialMatch", (partialEvent) => {
  let isMatch = false;
  const graylog = new Graylog(Cypress.env());
  // EdX writes logs to graylog asynchronously.
  // Therefore we wait a bit to get the results.
  cy.wait(100);
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
