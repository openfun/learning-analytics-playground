// LMS Enrollment Test

describe("LMS Enrollment Test as student", () => {
  before(() => {
    cy.lmsLogin(
      Cypress.env("EDX_STUDENT_EMAIL"),
      Cypress.env("EDX_STUDENT_PASSWORD")
    );
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce("csrftoken", "edxcsrftoken");
  });

  after(() => {
    cy.lmsLogout();
  });

  it("should enroll to the demo course", () => {
    cy.lmsEnroll(true);
  });

  it("should unenroll to the demo course", () => {
    cy.lmsEnroll(false);
  });

  it("should log enroll event", { retries: 9 }, () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.activated" });
  });

  it("should log unenroll event", { retries: 9 }, () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.deactivated" });
  });
});

describe("LMS Enrollment Test as admin", () => {
  before(() => {
    // Note: we are enrolling the student before adding the enrollment mode
    // to avoid additional steps in the enrollment process when there are
    // multiple enrollment modes available.
    cy.lmsLogin(
      Cypress.env("EDX_STUDENT_EMAIL"),
      Cypress.env("EDX_STUDENT_PASSWORD")
    );
    cy.lmsEnroll(true);
    cy.lmsLogout();
    cy.lmsLogin(
      Cypress.env("EDX_ADMIN_EMAIL"),
      Cypress.env("EDX_ADMIN_PASSWORD")
    );
    // add verified enrollment mode from the admin panel
    cy.visit("http://edx_lms:8000/admin/course_modes/coursemode/add/");
    cy.get("div > .module > .form-row > div > #id_course_id").type(
      "course-v1:organisation+numero_du_cours+course"
    );
    cy.get("div > .module > .form-row > div > #id_mode_slug").select(
      "verified"
    );
    cy.get("div > .module > .form-row > div > #id_mode_display_name").type(
      "verified"
    );
    cy.get(
      "#content-main > #coursemode_form > div > .submit-row > .default"
    ).click();
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce("csrftoken", "edxcsrftoken");
  });

  after(() => {
    // remove verified enrollment mode from the admin panel
    cy.visit("http://edx_lms:8000/admin/course_modes/coursemode/");
    cy.get(
      "tr > .action-checkbox-column > .text > span > #action-toggle"
    ).check("on");
    cy.get("#changelist > #changelist-form > .actions > label > select").select(
      "delete_selected"
    );
    cy.get(
      "#content-main > #changelist > #changelist-form > .actions > .button"
    ).click();
    cy.get("#container > #content > form > div > input:nth-child(4)").click();
    cy.lmsLogout();
    cy.lmsLogin(
      Cypress.env("EDX_STUDENT_EMAIL"),
      Cypress.env("EDX_STUDENT_PASSWORD")
    );
    cy.lmsEnroll(false);
    cy.lmsLogout();
  });

  it("should change a student enrollment mode", () => {
    // modify enrollment to verified mode
    // triggers edx.course.enrollment.mode_changed
    cy.getCookie("csrftoken")
      .should("exist")
      .then((cookie) => {
        cy.request({
          method: "POST",
          url: "http://edx_lms:8000/api/enrollment/v1/enrollment",
          form: true,
          headers: {
            "X-CSRFToken": cookie.value,
          },
          body: {
            csrfmiddlewaretoken: cookie.value,
            _content_type: "application/json",
            _content: JSON.stringify({
              mode: "verified",
              course_details: {
                course_id: "course-v1:organisation+numero_du_cours+course",
              },
            }),
          },
        });
      });
  });

  it("should upgrade a student enrollment mode", () => {
    // upgrade enrollment to verified mode
    cy.lmsLogout();
    cy.lmsLogin(
      Cypress.env("EDX_STUDENT_EMAIL"),
      Cypress.env("EDX_STUDENT_PASSWORD")
    );
    // triggers edx.course.enrollment.upgrade.clicked
    cy.get("#upgrade-to-verified").click();
    cy.lmsLogout();
    cy.lmsLogin(
      Cypress.env("EDX_ADMIN_EMAIL"),
      Cypress.env("EDX_ADMIN_PASSWORD")
    );
  });

  it("should log enrollment mode changed event", { retries: 9 }, () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.mode_changed" });
  });

  it("should log enrollment upgrade clicked event", { retries: 9 }, () => {
    cy.graylogPartialMatch({ name: "edx.course.enrollment.upgrade.clicked" });
  });
});
