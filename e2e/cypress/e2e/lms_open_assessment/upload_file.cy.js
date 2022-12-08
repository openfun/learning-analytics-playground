// LMS Open Assessment Upload File Test

import { getProblem, getSectionAndURL } from "../../support/utils";

describe("LMS Open Assessment Upload File Test", () => {
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
    cy.get(".file__description.file__description__0").type("File description");

    // Upload the selected file.
    // Triggers `openassessmentblock.save_files_descriptions` and
    // `openassessment.upload_file` events.
    cy.get(".file__upload").click();

    // Check that the file was uploaded with success.
    cy.get(".submission__answer__file").should("have.text", "File description");
  });

  it("should log openassessmentblock.save_files_descriptions server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.save_files_descriptions",
      event: {
        saved_response: '["File description"]',
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
});
