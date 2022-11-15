// LMS Custom Grader Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Custom Grader Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("customgrader");
  const problem = getProblem(section, "customgrader");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input wrong answers.
    cy.get(`#input_${problemId}_2_1`).clear().type("100");
    cy.get(`#input_${problemId}_2_2`).clear().type("0");
    cy.get(`#input_${problemId}_3_1`).clear().type("100");
    cy.get(`#input_${problemId}_3_2`).clear().type("10");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    cy.get(`#status_${problemId}_2_2`).should("contain", "incorrect");
    cy.get(`#status_${problemId}_3_1`).should("contain", "incorrect");
    cy.get(`#status_${problemId}_3_2`).should("contain", "incorrect");
    // Input correct answers.
    cy.get(`#input_${problemId}_2_1`).clear().type("10");
    cy.get(`#input_${problemId}_2_2`).clear().type("0");
    cy.get(`#input_${problemId}_3_1`).clear().type("10");
    cy.get(`#input_${problemId}_3_2`).clear().type("10");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_2_2`).should("contain", "correct");
    cy.get(`#status_${problemId}_3_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_3_2`).should("contain", "correct");
    cy.lmsEnroll(false);
  });

  it("should log problem_check server event", () => {
    const context = { module: { usage_key: problem.locator } };
    cy.graylogPartialMatch({ context, event_type: "problem_check" });
  });

  it("should log problem_check browser event", () => {
    const partial = { event_source: "browser", event_type: "problem_check" };
    cy.graylogPartialMatch(partial);
  });

  it("should log problem_graded browser event", () => {
    cy.graylogPartialMatch({ event_type: "problem_graded" });
  });
});
