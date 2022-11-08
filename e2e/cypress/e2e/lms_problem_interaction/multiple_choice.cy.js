// LMS Multiple Choice Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Multiple Choice Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("multiplechoice");
  const problem = getProblem(section, "multiplechoice");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input wrong answer.
    cy.get(`#input_${problemId}_2_1_choice_brazil`).check();
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(".hint-label").should("contain", "Incorrect");
    // Input correct answer.
    const indonesiaInput = `#input_${problemId}_2_1_choice_indonesia`;
    cy.get(indonesiaInput).check();
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`${indonesiaInput} + span`).should("contain", "correct");
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
