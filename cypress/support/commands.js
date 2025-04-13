// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// Create a new file: cypress/support/commands.js (if it doesn't exist)

// Custom command to add credits through the payment form
Cypress.Commands.add('addCredits', () => {
    // Navigate to the credits tab
    cy.get('[data-tab="credits"]').click();

    // Fill in payment information
    cy.get('#card-number').type('4242 4242 4242 4242');
    cy.get('#expiry-date').type('1225');
    cy.get('#cvv').type('123');
    cy.get('#card-name').type('John Doe');

    // Submit payment
    cy.get('#process-payment').click();

    // Wait for fake payment processing
    cy.wait(2500);
});

// Import commands.js in your cypress/support/e2e.js or cypress/support/index.js file
// Add: import './commands'