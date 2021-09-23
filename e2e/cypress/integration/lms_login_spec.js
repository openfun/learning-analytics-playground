// LMS Login Test

describe("LMS Login Test", () => {
  it("should fill login form and redirect to dashboard", { retries: 5 }, () => {
    // submit login form
    cy.lmsLogin("edx@example.com", "edx");

    // disconnect and return to home page
    cy.get(
      "nav#top-menu a.toggle-dropdown-menu.header-block.no-decoration > span"
    ).click();
    cy.get("nav#top-menu li:nth-child(3) > a").click();

    cy.title().should("include", "FUN - Se former en liberté");
  });
});
