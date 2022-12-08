// LMS JS Input Response Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS JS Input Response Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("jsinputResponse");
  const problem = getProblem(section, "jsinputResponse");
  const problemId = getXblockId(problem);

  const getIframeWindow = () => {
    return cy
      .get(`#iframe_${problemId}_2_1`)
      .its("0.contentWindow")
      .should("exist");
  };

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Reset Problem
    const { courseId } = Cypress.env("EDX_COURSES").demoCourse1;
    const handlerURL = "handler/xmodule_handler/problem_reset";
    const url = `/courses/${courseId}/xblock/${problem.locator}/${handlerURL}`;
    const method = "POST";
    const body = { id: problem.locator };
    cy.request({ url, method, body }).then((response) => {
      expect(response.status).to.equal(200);
    });
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Wait for iframe to become interactive.
    getIframeWindow().and((win) => {
      expect(win.WebGLDemo).to.be.an("object");
    });
    // Input wrong answers.
    cy.get(`#iframe_${problemId}_2_1`).click(118, 200);
    // Wait for iframe state to be updated.
    getIframeWindow().and((win) => {
      expect(win.WebGLDemo).to.be.an("object");
      expect(JSON.parse(win.WebGLDemo.getState())).deep.to.equal({
        selectedObjects: { cylinder: false, cube: true },
      });
    });
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "incorrect");
    // Input correct answers.
    cy.get(`#iframe_${problemId}_2_1`).click(300, 200);
    // Wait for iframe state to be updated.
    getIframeWindow().and((win) => {
      expect(win.WebGLDemo).to.be.an("object");
      expect(JSON.parse(win.WebGLDemo.getState())).to.deep.equal({
        selectedObjects: { cylinder: false, cube: false },
      });
    });
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
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
