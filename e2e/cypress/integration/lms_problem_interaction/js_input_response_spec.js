// LMS JS Input Response Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS JS Input Response Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("jsinputResponse");
  const problem = getProblem(section, "jsinputResponse");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Wait for iframe to become interactive.
    cy.wait(1500);
    // Input wrong answers.
    cy.get(`#iframe_${problemId}_2_1`).click(118, 200);
    cy.wait(200);
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    // Input correct answers.
    cy.get(`#iframe_${problemId}_2_1`).click(300, 200);
    cy.wait(200);
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

  it("should log problem_check browser event", () => {
    const partial = { event_source: "browser", event_type: "problem_check" };
    cy.graylogPartialMatch(partial);
  });

  it("should log problem_graded browser event", () => {
    cy.graylogPartialMatch({ event_type: "problem_graded" });
  });
});
