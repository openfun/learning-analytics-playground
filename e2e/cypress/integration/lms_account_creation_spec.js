const states = [
  { 
    "email": "student_1@example.com", 
    "name": "Student 1",
    "username": "student_1",
    "password": "PWD_student_1",
  },
  { 
    "email": "student_2@example.com", 
    "name": "Student 2",
    "username": "student_2",
    "password": "PWD_student_2",
  },
  { 
    "email": "student_3@example.com", 
    "name": "Student 3",
    "username": "student_3",
    "password": "PWD_student_3",
  },
]  

describe('Create user account', function() {

  states.forEach((state) => {
    it('creates a student account', function() {

      // access sign up form
      cy.visit('http://edx_lms:8000/');
      cy.get('nav#top-menu a.signup-link.header-block > span').click();

      // fill in sign up form
      cy.url().should('include', 'http://localhost:8072/register')
      cy.get('input#email').type(state.email);
      cy.get('input#name').type(state.name);
      cy.get('input#username').type(state.username);
      cy.get('input#password').type(state.password);
      cy.get('select#country').select('France');
      cy.get('input#city').type('Paris');
      cy.get('input#tos-yes').check();
      cy.get('input#honorcode-yes').check();

      // validate sign up form
      cy.get('form > button#submit').click();
      cy.wait(200)
      // accept payment terms
      cy.url().should('include', '/payment/terms/')
      cy.get('button#validate-terms').click();

      // disconnect and return to home page
      cy.url().should('include', 'dashboard')
      cy.get('nav#top-menu a.toggle-dropdown-menu.header-block.no-decoration > span').click()
      cy.get('nav#top-menu li:nth-child(3) > a').click()

      cy.title().should('include', 'FUN - Se former en liberté')

    })
  })
})
