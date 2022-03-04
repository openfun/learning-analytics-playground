// LMS Checkboxes Response With Hint Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Checkboxes Response With Hint Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("checkboxesResponseHint");
  const problem = getProblem(section, "checkboxesResponseHint");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Ask for a first hint.
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (1 sur 2) :");
    // Input wrong answers.
    cy.get(`#input_${problemId}_2_1_choice_0`).check();
    cy.get(`#input_${problemId}_2_1_choice_1`).check();
    cy.get(`#input_${problemId}_2_1_choice_2`).check();
    cy.get(`#input_${problemId}_2_1_choice_3`).check();
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    // Ask for a first hint (again).
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (1 sur 2) :");
    // Ask for a second hint.
    cy.get(".hint-button").click();
    cy.get(".problem-hint").should("contain", "Indice (2 sur 2) :");
    // Input correct answers.
    cy.get(`#input_${problemId}_2_1_choice_0`).check();
    cy.get(`#input_${problemId}_2_1_choice_1`).check();
    cy.get(`#input_${problemId}_2_1_choice_2`).uncheck();
    cy.get(`#input_${problemId}_2_1_choice_3`).check();
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
    cy.lmsEnroll(false);
  });

  it("should log problem_check server event", () => {
    const context = { module: { usage_key: problem.locator } };
    cy.graylogPartialMatch({ context, event_type: "problem_check" });
  });

  it("should log feedback_displayed server event", () => {
    const context = { module: { usage_key: problem.locator } };
    const eventType = "edx.problem.hint.feedback_displayed";
    cy.graylogPartialMatch({ context, event_type: eventType });
  });

  it("should log demandhint_displayed server event", () => {
    const context = { module: { usage_key: problem.locator } };
    const eventType = "edx.problem.hint.demandhint_displayed";
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
