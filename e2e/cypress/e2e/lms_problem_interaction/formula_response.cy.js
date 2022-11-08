// LMS Formula Response Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Formula Response Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("formularesponse");
  const problem = getProblem(section, "formularesponse");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input answers.
    cy.get(`#input_${problemId}_2_1`).clear().type("(R_1*R_2)/R_3");
    cy.get(`#input_${problemId}_3_1`).clear().type("n*x^(n-1)");
    // Wait for front-end to process answers.
    cy.get(`#input_${problemId}_2_1_preview`).should("contain", "3");
    cy.get(`#input_${problemId}_3_1_preview`).should("contain", "1");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#${problemId}_2_1_status`).should("contain", "correct");
    cy.get(`#${problemId}_3_1_status`).should("contain", "correct");
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
