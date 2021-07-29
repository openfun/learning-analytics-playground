const courses = [
  {
    'name': 'Course 1',
    'organization': 'Organization1',
    'number': 'CN001',
    'session': 'CS_101',
  },
  {
    'name': 'Course 2',
    'organization': 'Organization2',
    'number': 'CN002',
    'session': 'CS_201',
  },
]

describe('Create courses', function () {

  courses.forEach((course) => {
    it('creates a course', function () {

      cy.visit('http://edx_cms:8000/');

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
      cy.get('form#create-course-form input.action.action-primary.new-course-save').click({force:true});
      
      // return to home page
      cy.get('div#view-top img').click();
    })
  })
})

