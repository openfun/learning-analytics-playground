// LMS Drag And Drop Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Drag And Drop Problem Interaction Test", () => {
  const [section, sectionUrl] = getSectionAndURL("dragAndDrop");
  const problem = getProblem(section, "dragAndDrop");
  const problemId = getXblockId(problem);
  const dragTo = (number, x, y, isFirst = true) => {
    cy.get(
      `.problem > div:nth-child(1) > div:nth-child(1) >
      span:nth-child(${isFirst ? 6 : 7}) > div:nth-child(3) >
      div:nth-child(2) > div:nth-child(2) > div:nth-child(1) >
      div:nth-child(${number}) > div:nth-child(1)`
    ).trigger("mousedown", { which: 1 });
    cy.get(".base_image_container img")
      [isFirst ? "first" : "last"]()
      .trigger("mousemove", x, y, { force: true })
      .trigger("mouseup", { which: 1, force: true });
    cy.focused().trigger("mouseup", { which: 1, force: true }).blur();
  };

  before(() => {
    cy.lmsLoginStudent();
    cy.lmsEnroll(true);
    // Navigate to the courseware.
    cy.visit(sectionUrl);
    // Input answers (first image).
    dragTo(1, 60, 160);
    dragTo(2, 290, 100);
    dragTo(3, 540, 100);
    dragTo(4, 410, 100);
    dragTo(5, 540, 130);
    dragTo(6, 170, 100);
    dragTo(7, 410, 160);
    dragTo(8, 170, 160);
    dragTo(9, 290, 130);
    dragTo(10, 540, 160);
    dragTo(11, 290, 160);
    cy.get(".base_image_container img ~ div").should("have.length", 21);
    // Input answers (second image).
    dragTo(1, 33, 417, false);
    dragTo(2, 130, 417, false);
    cy.get(".base_image_container img ~ div").should("have.length", 23);
    // Submit answer.
    cy.get(".check.Valider").click();
    cy.get(".check.Valider").should("not.have.class", "is-disabled");
    cy.get(`#status_${problemId}_2_1`).should("contain", "correct");
    cy.get(`#status_${problemId}_3_1`).should("contain", "correct");
    cy.lmsEnroll(false);
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
