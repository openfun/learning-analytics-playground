// LMS LaTeX Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS LaTeX Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("latexProblem");
  const problem = getProblem(section, "latexProblem");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input answers.
    // Option Problem.
    cy.get(`#input_${problemId}_2_1`).select("India");
    // Multiple Choice Problem.
    const indonesiaInput = `#input_${problemId}_3_1_choice_indonesia`;
    cy.get(indonesiaInput).check();
    // Math Expression Problem.
    cy.get(`#input_${problemId}_4_1`).clear().type("m*c^2");
    cy.get(`#display_${problemId}_4_1`).should("contain", "2");
    // Numerical Problem.
    cy.get(`#input_${problemId}_5_1`).clear().type("0.52");
    // Fill-in-the-Blank Problem.
    cy.get(`#input_${problemId}_6_1`).clear().type("Nanjing University");
    // Custom Python evaluated Problem.
    cy.get(`#input_${problemId}_7_1`).clear().type("3");
    cy.get(`#input_${problemId}_7_2`).clear().type("7");
    cy.get(`#input_${problemId}_8_1`).clear().type("11");
    cy.get(`#input_${problemId}_8_2`).clear().type("9");
    // Image Mapped Input Problem.
    cy.get(`#imageinput_${problemId}_9_1`).click(400, 150);
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
    cy.get(`${indonesiaInput} + span`).should("contain", "correct");
    cy.get(`#status_${problemId}_4_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_5_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_6_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_7_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_7_2`).should("contain", "correct");
    cy.get(`#status_${problemId}_8_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_8_2`).should("contain", "correct");
    cy.get(`#status_${problemId}_9_1`).should("contain", "correct");
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
