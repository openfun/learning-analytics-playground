// LMS Problem Interaction Test

describe("LMS Problem Interaction Test", () => {
  before(() => {
    cy.lmsLogin("admin@example.com", "admin");
    cy.lmsEnroll(true);
  });

  after(() => {
    cy.lmsEnroll(false);
  });

  it("should produce logs for problem_check", () => {
    // visit the demo course
    cy.visit(
      "http://edx_lms:8000/courses/course-v1:organisation+numero_du_cours+course/info"
    );
    // change from admin to student view
    cy.get(
      ".preview-menu > .preview-actions > .action-preview > .action-preview-form > #action-preview-select"
    ).select("student");
    // refresh the page
    cy.visit(
      "http://edx_lms:8000/courses/course-v1:organisation+numero_du_cours+course/info"
    );
    // navigate to the courseware
    cy.visit(
      "http://edx_lms:8000/courses/course-v1:organisation+numero_du_cours+course/courseware/3aa3e4ce9b4c42cfaf7f30c1303af47f/353a0df407e54bb68498c541cb130f0f/"
    );
    // input student answers (first is wrong, second is correct)
    cy.get(
      "div > span > #formulaequationinput_55ede0e800484481922a9c24064fccab_2_1 > #status_55ede0e800484481922a9c24064fccab_2_1 > #input_55ede0e800484481922a9c24064fccab_2_1"
    ).type("10000");
    cy.get(
      "div > span > #formulaequationinput_55ede0e800484481922a9c24064fccab_3_1 > #status_55ede0e800484481922a9c24064fccab_3_1 > #input_55ede0e800484481922a9c24064fccab_3_1"
    ).type("10*i");
    // submit answer (problem_check)
    cy.get(
      "#problem_55ede0e800484481922a9c24064fccab > .problem > .action > .check > .check-label"
    ).click();
    cy.get("#55ede0e800484481922a9c24064fccab_2_1_status").contains(
      "incorrect"
    );
    cy.get("#55ede0e800484481922a9c24064fccab_3_1_status").contains("correct");
  });
});
