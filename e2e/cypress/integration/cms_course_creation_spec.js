const courses = [
  {
    'name': 'Course 1',
    'organization': 'Organization 1',
    'number': 'CN001',
    'session': 'CS_101',
  },
]

describe('Create courses', function () {

  courses.forEach((course) => {
    it('creates a course', function () {

      cy.visit('http://localhost:8082/');

      // enter credentials
      cy.get("div#view-top li.nav-item.nav-not-signedin-signin > a").click();
      cy.url().should('include', '/signin');
      cy.get("input#email").type('admin@example.com');
      cy.get("input#password").type('admin');

      // submit login form
      cy.get("button#submit").click();

      // we should be redirected to /home
      cy.url().should('include', '/home');

      // create courses
      cy.get('div#content a.button.new-button.new-course-button').click();
      cy.get('input#new-course-name').type(course.name, {force:true});
      cy.get('input#new-course-org').type(course.organization, {force:true});
      cy.get('input#new-course-number').type(course.number, {force:true});
      cy.get('input#new-course-run').type(course.session, {force:true});
      cy.get('form#create-course-form input.action.action-primary.new-course-save').click({ force:true });

      // create course contents
      cy.get('div#content nav > ul > li:nth-child(1) > a').click({ multiple: true });
      cy.get('div#content input').type('Section 1');
      cy.get('div#content div.outline-content.section-content > div > a').click();
      cy.get(
        'div#content div.subsection-header > h3 > span > div.xblock-string-field-editor.incontext-editor-form > form > label > input'
      ).type('Sous-section');
      cy.get('div#content div.outline-content.subsection-content > div > a').click();
      cy.get('div#content span.large-template-icon.large-problem-icon').click();
      cy.get(
        'div#content div.new-component-templates.new-component-problem > div > div#tab1 > ul > li:nth-child(4) > button[type="button"] > span'
      ).click();

      // publish contents
      cy.get('div#publish-unit div.wrapper-pub-actions.bar-mod-actions > ul > li:nth-child(1) > a').click();

      // program course
      cy.get('div#content div > ul > li > a > i').click();
      cy.url().should('include', 'settings/details/course-v1:' + course.organization + course.number + course.session);
      cy.get('input#course-start-date').type('2021/06/30');
      cy.get('input#course-end-date').type('2021/08/30');
      cy.get('input#course-enrollment-start-date').type('2021/06/29');
      cy.get('input#course-enrollment-end-date').type('2021/07/30');

      // save modifications
      cy.get('div#notification-warning li:nth-child(1) > button').click();

    })
  })
})


