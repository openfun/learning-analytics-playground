// LMS LaTeX Problem With Hint Interaction Test

const {
  getProblem,
  getSectionAndURL,
  getXblockId,
} = require("../../support/utils");

describe("LMS LaTeX Problem With Hint Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("problemWithHintInLatex");
  const problem = getProblem(section, "problemWithHintInLatex");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input wrong answer.
    cy.get(`#input_${problemId}_2_1`).clear().type("java");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    // Input correct answer.
    cy.get(`#input_${problemId}_2_1`).clear().type("python");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
    cy.lmsEnroll(false);
  });

  it("should log problem_check server event", { retries: 9 }, () => {
    const context = { module: { usage_key: problem.locator } };
    cy.graylogPartialMatch({ context, event_type: "problem_check" });
  });

  it("should log problem_check browser event", { retries: 9 }, () => {
    const partial = { event_source: "browser", event_type: "problem_check" };
    cy.graylogPartialMatch(partial);
  });

  it("should log problem_graded browser event", { retries: 9 }, () => {
    cy.graylogPartialMatch({ event_type: "problem_graded" });
  });
});
