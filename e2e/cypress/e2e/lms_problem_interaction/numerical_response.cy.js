// LMS Numerical Response Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Numerical Response Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("numericalresponse");
  const problem = getProblem(section, "numericalresponse");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input answers.
    cy.get(`#input_${problemId}_2_1`).clear().type("10000");
    cy.get(`#input_${problemId}_3_1`).clear().type("10*i");
    // Wait for front-end to process answers.
    cy.get(`#input_${problemId}_2_1_preview`).should("contain", "10000");
    cy.get(`#input_${problemId}_3_1_preview`).should("contain", "10⋅i");
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#${problemId}_2_1_status`).should("contain", "incorrect");
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
