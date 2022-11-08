// LMS Open Assessment Staff Assessment Test

import { getProblem, getSectionAndURL } from "../../support/utils";

describe("LMS Open Assessment Staff Assessment Test", () => {
  const [section, sectionUrl] = getSectionAndURL(
    "openAssessmentWithStaffAssessment"
  );
  const problem = getProblem(section, "openAssessmentWithStaffAssessment");

  before(() => {
    cy.on("uncaught:exception", (err) => {
      // The Electron browser fails to load files from the `edx-ui-toolkit`.
      if (err.message.includes("edx-ui-toolkit")) {
        return false;
      }
      return true;
    });

    cy.session("student", () => {
      cy.lmsCreateUser().then(({ email, password }) => {
        cy.lmsLogin(email, password);
        cy.lmsEnroll(true);
      });
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
      .type("Staff assess answer");

    // Submit answer.
    // Triggers `openassessmentblock.create_submission` event.
    cy.get(".action--submit").click();

    // Check that the answer was submitted with success.
    cy.get("#oa_step_status_response .copy").should("have.text", "Complet");

    cy.session("admin", () => cy.lmsLoginAdmin());

    // Navigate to the courseware.
    cy.visit(sectionUrl);

    // Click on the staff grading button.
    cy.get("button.ui-staff__button:nth-child(3)").click();

    // Open the list of submissions.
    // Triggers `openassessmentblock.get_submission_for_staff_grading` event.
    cy.get(".staff__grade__show-form").click();

    // Grade the student submission.
    cy.get(
      `#staff-full-grade__assessment__rubric__question--0__0__${escapedProblemLocator}`
    ).check();
    cy.get(
      `#staff-full-grade__assessment__rubric__question--0__feedback__${escapedProblemLocator}`
    ).type("Some staff comment");
    cy.get(
      `#staff-full-grade__assessment__rubric__question--1__0__${escapedProblemLocator}`
    ).check();
    cy.get(
      `#staff-full-grade__assessment__rubric__question--feedback__value__${escapedProblemLocator}`
    ).type("Some staff feedback");

    // Submit staff grading
    // Triggers `openassessmentblock.staff_assess` event.
    cy.get(".continue_grading--action").click();
  });

  it("should log openassessmentblock.create_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.create_submission",
      event: {
        answer: {
          parts: [{ text: "Staff assess answer" }],
        },
      },
    });
  });

  it("should log openassessmentblock.get_submission_for_staff_grading server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.get_submission_for_staff_grading",
      event: {
        type: "full-grade",
      },
    });
  });

  it("should log openassessmentblock.staff_assess server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.staff_assess",
      event: {
        feedback: "Some staff feedback",
        score_type: "ST",
        parts: [
          {
            criterion: { points_possible: 5, name: "Ideas" },
            option: { points: 0, name: "Poor" },
            feedback: "Some staff comment",
          },
          {
            criterion: { points_possible: 3, name: "Content" },
            option: { points: 0, name: "Poor" },
            feedback: "",
          },
        ],
      },
    });
  });
});
