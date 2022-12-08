// LMS Circuit Schematic Problem Interaction Test

import { getProblem, getSectionAndURL, getXblockId } from "../../support/utils";

describe("LMS Circuit Schematic Problem Interaction Test", () => {
  const { courseId } = Cypress.env("EDX_COURSES").demoCourse1;
  const [section] = getSectionAndURL("circuitschematic");
  const problem = getProblem(section, "circuitschematic");
  const problemId = getXblockId(problem);

  before(() => {
    cy.lmsCreateUser().then(({ email, password }) => {
      cy.lmsLogin(email, password);
      cy.lmsEnroll(true);
    });
    // Submit response.
    // Note: Circuit Schematic Problems are wrapped inside a canvas element.
    // To avoid manipulating the canvas element from cypress (which is complicated),
    // we send the submission via a post request.
    // This works, however we miss the problem_check and problem_graded browser events.
    cy.request({
      method: "POST",
      url: `/courses/${courseId}/xblock/${problem.locator}/handler/xmodule_handler/problem_check`,
      form: true,
      body: {
        [`input_${problemId}_2_1`]:
          // eslint-disable-next-line max-len
          '[["w",[296,120,296,168]],["w",[296,168,296,184]],["w",[296,120,168,120]],["r",[168,184,0],{"r":"1","_json_":3},["1","0"]],["v",[168,120,0],{"value":"dc(1)","_json_":4},["output","1"]],["r",[296,184,0],{"r":"1","_json_":5},["output","0"]],["L",[296,168,3],{"label":"output","_json_":6},["output"]],["g",[216,232,0],{"_json_":7},["0"]],["w",[168,168,168,184]],["w",[168,232,216,232]],["w",[296,232,216,232]],["view",111.87136,75.04352,2.44140625,null,"10","1G",null,"100","1","1000"],["dc",{"0":0,"1":-0.49999999999999994,"output":0.5,"I(_4)":-0.5}]]',
      },
    });
  });

  it("should log problem_check server event", () => {
    const context = { module: { usage_key: problem.locator } };
    cy.graylogPartialMatch({ context, event_type: "problem_check" });
  });
});
