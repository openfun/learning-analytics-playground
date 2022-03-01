// LMS Login Test

describe("LMS Login Test", () => {
  it("should fill login form and redirect to dashboard", { retries: 5 }, () => {
    cy.visit("/login");

    // enter credentials
    cy.get("input#email").type(`${Cypress.env("EDX_STUDENT_EMAIL")}`);
    cy.get("div:nth-child(4) > input[name=password]").type(
      `${Cypress.env("EDX_STUDENT_PASSWORD")}`
    );

    // submit login form
    cy.get("form > button#submit").click();

    // redirect to dashboard page
    cy.url().should("include", "/dashboard");
  });
});
