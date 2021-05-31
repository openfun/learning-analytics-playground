// CMS Login Test

describe('CMS Login Test', () => {     

    it('should fill login form and redirect to home', () => {
        
        cy.visit('http://edx_cms:8000/')

        // enter credentials
        cy.get("div#view-top li.nav-item.nav-not-signedin-signin > a").click()
        cy.url().should('include', '/signin')
        cy.get("input#email").type('admin@example.com')
        cy.get("input#password").type('admin')

        // submit login form
        cy.get("button#submit").click()

        // redirect to home page
        cy.url().should('include', '/home')

        // disconnect 
        cy.get('div#view-top li.nav-item.nav-account-user > h3').click()
        cy.get('div#view-top li.nav-item.nav-account-signout > a').click({force:true})

        cy.title().should('include', 'Bienvenue | Studio')
    });
})
