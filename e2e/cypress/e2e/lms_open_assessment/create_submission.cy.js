// LMS Open Assessment Create Submission Test

import { getProblem, getSectionAndURL } from "../../support/utils";

describe("LMS Open Assessment Create Submission Test", () => {
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
      .type("Student answer");

    // Submit answer.
    // Triggers `openassessmentblock.create_submission` event.
    cy.get("button.action--submit:nth-child(1)").click();

    // Check that the answer was submitted with success.
    cy.get("#oa_step_status_response .copy").should("have.text", "Complet");
  });

  it("should log openassessmentblock.create_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.create_submission",
      event: {
        answer: {
          parts: [{ text: "Student answer" }],
        },
      },
    });
  });
});

describe("LMS Open Assessment Create Submission Test With Two Prompts", () => {
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

    // Input two answers.
    const escapedProblemLocator = problem.locator
      .replaceAll(":", "\\:")
      .replaceAll("+", "\\+")
      .replaceAll("@", "\\@");
    cy.get(`#submission__answer__part__text__1__${escapedProblemLocator}`)
      .clear()
      .type("Student answer 1");
    cy.get(`#submission__answer__part__text__2__${escapedProblemLocator}`)
      .clear()
      .type("Student answer 2");

    // Submit answer.
    // Triggers `openassessmentblock.create_submission` event.
    cy.get("button.action--submit:nth-child(1)").click();

    // Check that the answer was submitted with success.
    cy.get("#oa_step_status_response .copy").should("have.text", "Complet");
  });

  it("should log openassessmentblock.create_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.create_submission",
      event: {
        answer: {
          parts: [{ text: "Student answer 1" }, { text: "Student answer 2" }],
        },
      },
    });
  });
});

describe("LMS Open Assessment Create Submission Test With One File Upload", () => {
  const [section, sectionUrl] = getSectionAndURL(
    "openAssessmentWithTwoTextPromptsAndOptionalFile"
  );
  const problem = getProblem(
    section,
    "openAssessmentWithTwoTextPromptsAndOptionalFile"
  );

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

    // Select 1 file for upload.
    const escapedProblemLocator = problem.locator
      .replaceAll(":", "\\:")
      .replaceAll("+", "\\+")
      .replaceAll("@", "\\@");
    cy.get(`#submission_answer_upload_${escapedProblemLocator}`).selectFile(
      "cypress/fixtures/pdf_file_1.pdf"
    );
    cy.get(".file__description.file__description__0").type("Description");

    // Upload the selected file.
    // Triggers `openassessmentblock.save_files_descriptions` and
    // `openassessment.upload_file` events.
    cy.get(".file__upload").click();

    // Check that the file was uploaded with success.
    cy.get(".submission__answer__file").should("have.text", "Description");

    // Input one answer.
    cy.get(`#submission__answer__part__text__1__${escapedProblemLocator}`)
      .clear()
      .type("Student answer 1");

    // Submit answer.
    // Triggers `openassessmentblock.create_submission` event.
    cy.get("button.action--submit:nth-child(1)").click();

    // Check that the answer was submitted with success.
    cy.get("#oa_step_status_response .copy").should("have.text", "Complet");
  });

  it("should log openassessmentblock.save_files_descriptions server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.save_files_descriptions",
      event: {
        saved_response: '["Description"]',
      },
    });
  });

  it("should log long openassessment.upload_file browser event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessment.upload_file",
      event:
        '{"fileType": "application/pdf", "fileSize": 1174, ' +
        '"fileName": "pdf_file_1.pdf"}',
    });
  });

  it("should log openassessmentblock.create_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.create_submission",
      event: {
        answer: {
          parts: [{ text: "Student answer 1" }, { text: "" }],
          files_descriptions: ["Description"].concat(...new Array(19).fill("")),
        },
      },
    });
  });
});
