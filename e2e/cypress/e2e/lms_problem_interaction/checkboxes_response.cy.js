// LMS Checkboxes Response Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Checkboxes Response Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("checkboxesResponse");
  const problem = getProblem(section, "checkboxesResponse");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input wrong answers.
    cy.get(`#input_${problemId}_2_1_choice_0`).check();
    cy.get(`#input_${problemId}_2_1_choice_1`).check();
    cy.get(`#input_${problemId}_2_1_choice_2`).check();
    cy.get(`#input_${problemId}_2_1_choice_3`).check();
    cy.get(`#input_${problemId}_2_1_choice_4`).check();
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    // Input correct answers.
    cy.get(`#input_${problemId}_2_1_choice_0`).check();
    cy.get(`#input_${problemId}_2_1_choice_1`).uncheck();
    cy.get(`#input_${problemId}_2_1_choice_2`).check();
    cy.get(`#input_${problemId}_2_1_choice_3`).check();
    cy.get(`#input_${problemId}_2_1_choice_4`).uncheck();
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
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
