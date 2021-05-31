// LMS Login Test

describe('LMS Login Test', () => {
    
  it('should fill login form and redirect to dashboard', () => {
    cy.visit('http://edx_lms:8000/login')

    // enter credentials
    cy.get("input#email").type('edx@example.com')
    cy.get("div:nth-child(4) > input[name=password]").type('edx')

    // submit login form
    cy.get("form > button#submit").click()

    // redirect to dashboard page
    cy.url().should('include', '/dashboard')

    // disconnect and return to home page
    cy.get('nav#top-menu a.toggle-dropdown-menu.header-block.no-decoration > span').click()
    cy.get('nav#top-menu li:nth-child(3) > a').click()

    cy.title().should('include', 'FUN - Se former en liberté')
  });
})
