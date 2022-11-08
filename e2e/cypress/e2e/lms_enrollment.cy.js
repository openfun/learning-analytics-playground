// LMS enrollment tests

describe("LMS Student Enrollment Test", () => {
  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
      cy.lmsEnroll(false);
    });
  });

  it("should log enrollment activated event", () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.activated" });
  });

  it("should log enrollment deactivated event", () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.deactivated" });
  });
});

describe("LMS Change Enrollment Test", () => {
  before(() => {
    const { courseId } = Cypress.env("EDX_COURSES").demoCourse1;

    // Note: enrolling the student before adding a new enrollment mode
    // avoids additional steps during enrollment.
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
      cy.lmsLoginAdmin();

      // Add `verified` enrollment mode from the admin panel.
      cy.visit("/admin/course_modes/coursemode/add/");
      cy.get("#id_course_id").type(courseId);
      cy.get("#id_mode_slug").select("verified");
      cy.get("#id_mode_display_name").type("verified");
      cy.get("#id_min_price").clear().type("1");
      cy.get("#coursemode_form > div > .submit-row > .default").click();

      // Modify enrollment to verified mode.
      // Triggers edx.course.enrollment.mode_changed
      cy.getCookie("csrftoken")
        .should("exist")
        .then((cookie) => {
          cy.request({
            method: "POST",
            url: "/api/enrollment/v1/enrollment",
            form: true,
            body: {
              csrfmiddlewaretoken: cookie.value,
              _content_type: "application/json",
              _content: JSON.stringify({
                mode: "verified",
                course_details: { course_id: courseId },
              }),
            },
          });
        });

      // Upgrade enrollment to verified mode.
      // Triggers edx.course.enrollment.upgrade.clicked
      cy.lmsLogin(email, password);
      cy.visit("/dashboard");
      cy.get("#upgrade-to-verified").click();
      cy.url().should("include", "/verify_student/upgrade/");
      // Go to fake payment page.
      cy.get("#CyberSource2").click({ force: true });
      // Submit fake payment.
      // Triggers edx.course.enrollment.upgrade.succeeded
      cy.get("form[name=input] input[type=submit]").click();
      cy.url().should("include", "/verify_student/payment-confirmation/");
    });

    // Remove verified enrollment mode from the admin panel.
    cy.lmsLoginAdmin();
    cy.visit("/admin/course_modes/coursemode/");
    cy.get("#action-toggle").check();
    cy.get("#changelist-form select").select("delete_selected");
    cy.get("#changelist-form button").click();
    cy.get("form div input:last-of-type").click();

    // Reset admin enrollment from `verified` back to `honor` mode.
    cy.lmsEnroll(false);
    cy.lmsEnroll(true);
  });

  it("should log enrollment mode changed event", () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.mode_changed" });
  });

  it("should log enrollment upgrade clicked event", () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.upgrade.clicked" });
  });

  it("should log enrollment upgrade succeeded event", () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.upgrade.succeeded" });
  });
});
