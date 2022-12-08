// LMS Open Assessment student peer assess Test

import { getProblem, getSectionAndURL } from "../../support/utils";

describe("LMS Open Assessment Peer Assess Example Test", () => {
  const [section, sectionUrl] = getSectionAndURL("defaultOpenAssessment");
  const problem = getProblem(section, "defaultOpenAssessment");
  const escapedProblemLocator = problem.locator
    .replaceAll(":", "\\:")
    .replaceAll("+", "\\+")
    .replaceAll("@", "\\@");
  const users = [];

  before(() => {
    cy.on("uncaught:exception", (err) => {
      // The Electron browser fails to load files from the `edx-ui-toolkit`.
      if (err.message.includes("edx-ui-toolkit")) {
        return false;
      }
      return true;
    });

    Cypress._.times(6, () =>
      cy.lmsCreateUser().then((user) => users.push(user))
    );

    const createSubmission = (email, password) => {
      cy.session(["submission", email], () => {
        cy.task("log", `logging in and enrolling user: '${email}'`);
        cy.lmsLogin(email, password).then(() => cy.lmsEnroll(true));

        // Navigate to the courseware.
        cy.visit(sectionUrl);

        // Input answer.
        cy.get(`#submission__answer__part__text__1__${escapedProblemLocator}`)
          .clear()
          .type(`Peer assess answer`);

        // Submit answer.
        // Triggers `openassessmentblock.create_submission` event.
        cy.get("button.action--submit:nth-child(1)").click();

        // Check that the answer was submitted with success.
        cy.get("#oa_step_status_response .copy").should("have.text", "Complet");

        // Select correct student training answers (part 1).
        cy.get(
          `#training__assessment__rubric__question--0__1__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#training__assessment__rubric__question--1__2__${escapedProblemLocator}`
        ).check();

        // Submit student training answer (part 1).
        // Triggers `openassessment.student_training_assess_example` event.
        cy.get(".student-training--001__assessment__submit").click();

        // Select correct student training answers (part 2).
        cy.get(
          `#training__assessment__rubric__question--0__0__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#training__assessment__rubric__question--1__2__${escapedProblemLocator}`
        ).check();

        // Submit student training answer (part 2).
        // Triggers `openassessment.student_training_assess_example` event.
        // Triggers `openassessmentblock.get_peer_submission` event.
        cy.get(".student-training--001__assessment__submit").click();

        // Check that the answer was submitted with success.
        cy.get("#oa_step_status").should("have.text", "Complet");
      });
    };

    // Create 6 submissions.
    cy.wrap(users).each(({ email, password }) => {
      createSubmission(email, password);
    });

    const performPeerReview = (email, password) => {
      cy.session(["peerReview", email], () => {
        cy.task("log", `logging in user: '${email}'`);
        cy.lmsLogin(email, password);

        // Navigate to the courseware.
        cy.visit(sectionUrl);

        // Fill out first peer review.
        cy.get(
          `#peer__assessment__rubric__question--0__1__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--1__3__${escapedProblemLocator}`
        ).check();

        // Submit first peer review.
        // Triggers `openassessmentblock.peer_assess`.
        cy.get(".peer-assessment--001__assessment__submit").click();

        // Check that the review was submitted with success.
        cy.get("#oa_step_status_peer").should("include.text", "(2 of 5)");

        // Fill out second peer review.
        cy.get(
          `#peer__assessment__rubric__question--0__0__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--1__0__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--0__feedback__${escapedProblemLocator}`
        ).type("Some comment");

        // Submit second peer review.
        // Triggers `openassessmentblock.peer_assess`.
        cy.get(".peer-assessment--001__assessment__submit").click();

        // Check that the review was submitted with success.
        cy.get("#oa_step_status_peer").should("include.text", "(3 of 5)");

        // Fill out third peer review.
        cy.get(
          `#peer__assessment__rubric__question--0__1__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--1__3__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--feedback__value__${escapedProblemLocator}`
        ).type("Some feedback");

        // Submit third peer review.
        // Triggers `openassessmentblock.peer_assess`.
        cy.get(".peer-assessment--001__assessment__submit").click();

        // Check that the review was submitted with success.
        cy.get("#oa_step_status_peer").should("include.text", "(4 of 5)");

        // Fill out forth peer review.
        cy.get(
          `#peer__assessment__rubric__question--0__2__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--1__2__${escapedProblemLocator}`
        ).check();

        // Submit forth peer review.
        // Triggers `openassessmentblock.peer_assess`.
        cy.get(".peer-assessment--001__assessment__submit").click();

        // Check that the review was submitted with success.
        cy.get("#oa_step_status_peer").should("include.text", "(5 of 5)");

        // Fill out fifth peer review.
        cy.get(
          `#peer__assessment__rubric__question--0__1__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#peer__assessment__rubric__question--1__1__${escapedProblemLocator}`
        ).check();

        // Submit fifth peer review.
        // Triggers `openassessmentblock.peer_assess`.
        cy.get(".peer-assessment--001__assessment__submit").click();

        // Check that the review was submitted with success.
        cy.get(".step__status__value--completed").should("have.text", "5");

        // Fill out self assessment.
        cy.get(
          `#self__assessment__rubric__question--0__0__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#self__assessment__rubric__question--0__feedback__${escapedProblemLocator}`
        ).type("Some comment about the assessment");
        cy.get(
          `#self__assessment__rubric__question--1__3__${escapedProblemLocator}`
        ).check();
        cy.get(
          `#self__assessment__rubric__question--feedback__value__${escapedProblemLocator}`
        ).type("Some self feedback");

        // Submit the self assessment.
        // Triggers `openassessmentblock.self_assess`.
        cy.get(".self-assessment--001__assessment__submit").click();

        // Check that the answer was submitted with success.
        cy.get("#oa_step_status_self").should("have.text", "Complet");
      });
    };

    // Each student peer-reviews five other submissions and submits his self-assessment.
    cy.wrap(users).each(({ email, password }) => {
      performPeerReview(email, password);
    });

    // Create one feedback submission.
    cy.wrap(users).then((allUsers) => {
      cy.session("submitFeedback", () => {
        cy.task("log", `logging in the first user: '${allUsers[0].email}'`);
        cy.lmsLogin(allUsers[0].email, allUsers[0].password);

        // Navigate to the courseware.
        cy.visit(sectionUrl);

        // Fill in the feedback form.
        cy.get(
          `#feedback__overall__value--useful__${escapedProblemLocator}`
        ).check();
        cy.get(`#feedback__remarks__value__${escapedProblemLocator}`).type(
          "Some feedback on the peer evaluation"
        );

        // Submit feedback.
        // Triggers `openassessmentblock.submit_feedback_on_assessments`.
        cy.get(".feedback__submit").click();
      });
    });
  });

  it("should log openassessmentblock.create_submission server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.create_submission",
      event: {
        answer: {
          parts: [{ text: "Peer assess answer" }],
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
      },
    });
  });

  it("should log openassessmentblock.peer_assess server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.peer_assess",
      event: {
        score_type: "PE",
      },
    });
  });

  it("should log openassessmentblock.peer_assess server event with comment", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.peer_assess",
      event: {
        score_type: "PE",
        parts: [
          {
            criterion: {
              points_possible: 5,
              name: "Ideas",
            },
            option: {
              points: 0,
              name: "Poor",
            },
            feedback: "Some comment",
          },
          {
            criterion: {
              points_possible: 3,
              name: "Content",
            },
            option: {
              points: 0,
              name: "Poor",
            },
            feedback: "",
          },
        ],
      },
    });
  });

  it("should log openassessmentblock.peer_assess server event with feedback", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.peer_assess",
      event: {
        score_type: "PE",
        feedback: "Some feedback",
      },
    });
  });

  it("should log openassessmentblock.self_assess server event with comment and feedback", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.self_assess",
      event: {
        score_type: "SE",
        parts: [
          {
            criterion: {
              points_possible: 5,
              name: "Ideas",
            },
            option: {
              points: 0,
              name: "Poor",
            },
            feedback: "Some comment about the assessment",
          },
          {
            criterion: {
              points_possible: 3,
              name: "Content",
            },
            option: {
              points: 3,
              name: "Excellent",
            },
            feedback: "",
          },
        ],
        feedback: "Some self feedback",
      },
    });
  });

  it("should log openassessmentblock.submit_feedback_on_assessments server event", () => {
    cy.graylogPartialMatch({
      event_type: "openassessmentblock.submit_feedback_on_assessments",
      event: {
        feedback_text: "Some feedback on the peer evaluation",
      },
    });
  });
});
