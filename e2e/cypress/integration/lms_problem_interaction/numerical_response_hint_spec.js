// LMS Numerical Response With Hint Problem Interaction Test

const {
  getProblem,
  getSectionAndURL,
  getXblockId,
} = require("../../support/utils");

describe("LMS Numerical Response With Hint Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("numericalresponseHint");
  const problem = getProblem(section, "numericalresponseHint");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input wrong answers.
    cy.get(`#input_${problemId}_2_1`).clear().type("10000");
    // Wait for front-end to process answers.
    cy.get(`#input_${problemId}_2_1_preview`).should("contain", "10000");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#${problemId}_2_1_status`).should("contain", "incorrect");
    // Ask for a first hint.
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (1 sur 2) :");
    // Ask for a second hint.
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (2 sur 2) :");
    // Input correct answer.
    cy.get(`#input_${problemId}_2_1`).clear().type("4");
    // Wait for front-end to process answers.
    cy.get(`#input_${problemId}_2_1_preview`).should("contain", "4");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#${problemId}_2_1_status`).should("contain", "correct");
    cy.lmsEnroll(false);
  });

  it("should log problem_check server event", { retries: 9 }, () => {
    const context = { module: { usage_key: problem.locator } };
    cy.graylogPartialMatch({ context, event_type: "problem_check" });
  });

  it("should log demandhint_displayed server event", { retries: 9 }, () => {
    const context = { module: { usage_key: problem.locator } };
    const eventType = "edx.problem.hint.demandhint_displayed";
    cy.graylogPartialMatch({ context, event_type: eventType });
  });

  it("should log problem_check browser event", { retries: 9 }, () => {
    const partial = { event_source: "browser", event_type: "problem_check" };
    cy.graylogPartialMatch(partial);
  });

  it("should log problem_graded browser event", { retries: 9 }, () => {
    cy.graylogPartialMatch({ event_type: "problem_graded" });
  });
});
