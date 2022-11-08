// LMS Open Assessment Save Submission Test

import { getProblem, getSectionAndURL } from "../../support/utils";

describe("LMS Open Assessment Save Submission Test", () => {
  const [section, sectionUrl] = getSectionAndURL("defaultOpenAssessment");
  const problem = getProblem(section, "defaultOpenAssessment");

  before(() => {
    cy.on("uncaught:exception", (err) => {
      // The Electron browser fails to load files from the `edx-ui-toolkit`.
      if (err.message.includes("edx-ui-toolkit")) {
        return false;
      }
      return true;
    });

    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });

    // Navigate to the courseware.
    cy.visit(sectionUrl);

    // Input answer.
    const escapedProblemLocator = problem.locator
      .replaceAll(":", "\\:")
      .replaceAll("+", "\\+")
      .replaceAll("@", "\\@");
    cy.get(`#submission__answer__part__text__1__${escapedProblemLocator}`)
      .clear()
      .type("Saved answer");

    // Save answer.
    // Triggers `openassessmentblock.save_submission` event.
    cy.get(".action--save").click();
  });

  it("should log openassessmentblock.save_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.save_submission",
      event: {
        saved_response: '{"parts": [{"text": "Saved answer"}]}',
      },
    });
  });
});

describe("LMS Open Assessment Save Submission Test With Two Prompts", () => {
  const [section, sectionUrl] = getSectionAndURL(
    "openAssessmentWithTwoTextPrompts"
  );
  const problem = getProblem(section, "openAssessmentWithTwoTextPrompts");

  before(() => {
    cy.on("uncaught:exception", (err) => {
      // The Electron browser fails to load files from the `edx-ui-toolkit`.
      if (err.message.includes("edx-ui-toolkit")) {
        return false;
      }
      return true;
    });

    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });

    // Navigate to the courseware.
    cy.visit(sectionUrl);

    // Input answer.
    const escapedProblemLocator = problem.locator
      .replaceAll(":", "\\:")
      .replaceAll("+", "\\+")
      .replaceAll("@", "\\@");
    cy.get(`#submission__answer__part__text__1__${escapedProblemLocator}`)
      .clear()
      .type("Saved answer");

    // Save answer.
    // Triggers `openassessmentblock.save_submission` event.
    cy.get(".action--save").click();
  });

  it("should log openassessmentblock.save_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.save_submission",
      event: {
        saved_response: '{"parts": [{"text": "Saved answer"}, {"text": ""}]}',
      },
    });
  });
});
