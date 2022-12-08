// LMS String Response With Hint Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS String Response With Hint Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("stringResponseHint");
  const problem = getProblem(section, "stringResponseHint");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input wrong answers.
    cy.get(`#input_${problemId}_2_1`).clear().type("Texas");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    // Ask for a first hint.
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (1 sur 2) :");
    // Ask for a second hint.
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (2 sur 2) :");
    // Input correct answer.
    cy.get(`#input_${problemId}_2_1`).clear().type("Alaska");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
  });

  it("should log problem_check server event", () => {
    const context = { module: { usage_key: problem.locator } };
    cy.graylogPartialMatch({ context, event_type: "problem_check" });
  });

  it("should log demandhint_displayed server event", () => {
    const context = { module: { usage_key: problem.locator } };
    const eventType = "edx.problem.hint.demandhint_displayed";
    cy.graylogPartialMatch({ context, event_type: eventType });
  });

  it("should log feedback_displayed server event", () => {
    const context = { module: { usage_key: problem.locator } };
    const eventType = "edx.problem.hint.feedback_displayed";
    cy.graylogPartialMatch({ context, event_type: eventType });
  });

  it("should log problem_check browser event", () => {
    const partial = { event_source: "browser", event_type: "problem_check" };
    cy.graylogPartialMatch(partial);
  });

  it("should log problem_graded browser event", () => {
    cy.graylogPartialMatch({ event_type: "problem_graded" });
  });
});
