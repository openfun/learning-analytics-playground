// LMS Enrollment Test

describe("LMS Enrollment Test", () => {
  before(() => {
    cy.lmsLogin("admin@example.com", "admin");
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce("csrftoken", "edxcsrftoken");
  });

  it("should enroll to the demo course", { retries: 5 }, () => {
    cy.lmsEnroll(true);
  });

  it("should unenroll to the demo course", { retries: 5 }, () => {
    cy.lmsEnroll(false);
  });
});
