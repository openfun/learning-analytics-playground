// CMS Login Test

describe("CMS Login Test", () => {
  it("should fill login form and redirect to home", () => {
    cy.visit(Cypress.env("EDX_CMS_URL"));

    // enter credentials
    cy.get("div#view-top li.nav-item.nav-not-signedin-signin > a").click();
    cy.url().should("include", "/signin");
    cy.get("input#email").type(`${Cypress.env("EDX_ADMIN_EMAIL")}`);
    cy.get("input#password").type(`${Cypress.env("EDX_ADMIN_PASSWORD")}`);

    // submit login form
    cy.get("button#submit").click();

    // redirect to home page
    cy.url().should("include", "/home");

    // disconnect
    cy.get("div#view-top li.nav-item.nav-account-user > h3").click();
    cy.get("div#view-top li.nav-item.nav-account-signout > a").click({
      force: true,
    });

    cy.title().should("include", "Bienvenue | Studio");
  });
});
