// LMS Open Assessment student training assess example Test

import { getProblem, getSectionAndURL } from "../../support/utils";

describe("LMS Open Assessment Student Training Assess Example Test", () => {
  const [section, sectionUrl] = getSectionAndURL(
    "StudentTrainingDefaultOpenAssessment"
  );
  const problem = getProblem(section, "StudentTrainingDefaultOpenAssessment");

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
      .type("Saved training assessment answer");

    // Submit answer.
    // Triggers `openassessmentblock.create_submission` event.
    cy.get("button.action--submit:nth-child(1)").click();

    // Check that the answer was submitted with success.
    cy.get("#oa_step_status_response .copy").should("have.text", "Complet");

    // Select wrong student training answers (part 1)
    cy.get(
      `#training__assessment__rubric__question--0__0__${escapedProblemLocator}`
    ).check();
    cy.get(
      `#training__assessment__rubric__question--1__0__${escapedProblemLocator}`
    ).check();

    // Submit answer
    // Triggers `openassessment.student_training_assess_example` event.
    cy.get(".student-training--001__assessment__submit").click();

    // Select correct student training answers (part 1)
    cy.get(
      `#training__assessment__rubric__question--0__1__${escapedProblemLocator}`
    ).check();
    cy.get(
      `#training__assessment__rubric__question--1__2__${escapedProblemLocator}`
    ).check();

    // Submit answer
    // Triggers `openassessment.student_training_assess_example` event.
    cy.get(".student-training--001__assessment__submit").click();

    // Select partially wrong student training answers (part 2)
    cy.get(
      `#training__assessment__rubric__question--0__0__${escapedProblemLocator}`
    ).check();
    cy.get(
      `#training__assessment__rubric__question--1__3__${escapedProblemLocator}`
    ).check();

    // Submit answer
    // Triggers `openassessment.student_training_assess_example` event.
    cy.get(".student-training--001__assessment__submit").click();

    // Select correct student training answers (part 2)
    cy.get(
      `#training__assessment__rubric__question--0__0__${escapedProblemLocator}`
    ).check();
    cy.get(
      `#training__assessment__rubric__question--1__2__${escapedProblemLocator}`
    ).check();

    // Submit answer
    // Triggers `openassessment.student_training_assess_example` event.
    // Triggers `openassessmentblock.get_peer_submission`
    cy.get(".student-training--001__assessment__submit").click();

    // Check that the answer was submitted with success.
    cy.get("#oa_step_status").should("have.text", "Complet");
  });

  it("should log openassessmentblock.create_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.create_submission",
      event: {
        answer: {
          parts: [{ text: "Saved training assessment answer" }],
        },
      },
    });
  });

  it("should log openassessment.student_training_assess_example server event with wrong answer", () => {
    cy.graylogPartialMatch({
      event_type: "openassessment.student_training_assess_example",
      event: {
        options_selected: {
          Content: "Poor",
          Ideas: "Poor",
        },
        corrections: {
          Content: "Good",
          Ideas: "Fair",
        },
      },
    });
  });

  it("should log openassessment.student_training_assess_example server event with correct answer in part 1", () => {
    cy.graylogPartialMatch({
      event_type: "openassessment.student_training_assess_example",
      event: {
        options_selected: {
          Content: "Good",
          Ideas: "Fair",
        },
        corrections: {},
      },
    });
  });

  it("should log openassessment.student_training_assess_example server event with partially wrong answer", () => {
    cy.graylogPartialMatch({
      event_type: "openassessment.student_training_assess_example",
      event: {
        options_selected: {
          Content: "Excellent",
          Ideas: "Poor",
        },
        corrections: {
          Content: "Good",
        },
      },
    });
  });

  it("should log openassessment.student_training_assess_example server event with correct answer in part 2", () => {
    cy.graylogPartialMatch({
      event_type: "openassessment.student_training_assess_example",
      event: {
        options_selected: {
          Content: "Good",
          Ideas: "Poor",
        },
        corrections: {},
      },
    });
  });

  it("should log openassessmentblock.get_peer_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.get_peer_submission",
      event: {
        item_id: problem.locator,
        submission_returned_uuid: null,
      },
    });
  });
});
