// cypress/e2e/calculator.spec.js

describe('Advanced Calculator Tests', () => {
  beforeEach(() => {
    cy.visit('') // ill deploy then put the link 
    cy.window().its('calculatorInstance').should('exist')
  })

  describe('Free Features Tests', () => {
    it('should perform basic operations', () => {
      cy.get('[data-tab="basic"]').click()

      // Test addition
      cy.get('#num1').type('10')
      cy.get('#basic-operation').select('add')
      cy.get('#num2').type('5')
      cy.get('#basic button[type="submit"]').click()
      cy.get('#basic-result').should('contain', '15')

      // Test division with remainder
      cy.get('#num1').clear().type('10')
      cy.get('#basic-operation').select('divide')
      cy.get('#num2').clear().type('3')
      cy.get('#basic button[type="submit"]').click()
      cy.get('#basic-result').invoke('text').then(parseFloat).should('be.closeTo', 3.3333, 0.001)

      // Test division by zero
      cy.get('#num2').clear().type('0')
      cy.get('#basic button[type="submit"]').click()
      cy.get('#basic-result').should('contain', 'Division by zero')
    })

    it('should solve linear equations', () => {
      cy.get('[data-tab="linear"]').click()

      cy.get('#linear-a').type('2')
      cy.get('#linear-b').type('6')
      cy.get('#linear button[type="submit"]').click()
      cy.get('#linear-result').should('contain', 'x = -3.0000')

      // Test no solution
      cy.get('#linear-a').clear().type('0')
      cy.get('#linear-b').clear().type('5')
      cy.get('#linear button[type="submit"]').click()
      cy.get('#linear-result').should('contain', 'No solution')
    })

    it('should solve quadratic equations', () => {
      cy.get('[data-tab="quadratic"]').click()

      // Real roots
      cy.get('#quad-a').type('1')
      cy.get('#quad-b').type('-5')
      cy.get('#quad-c').type('6')
      cy.get('#quadratic button[type="submit"]').click()
      cy.get('#quadratic-result').should('contain', 'x₁ = 3.0000, x₂ = 2.0000')

      // Complex roots
      cy.get('#quad-a').clear().type('1')
      cy.get('#quad-b').clear().type('2')
      cy.get('#quad-c').clear().type('5')
      cy.get('#quadratic button[type="submit"]').click()
      cy.get('#quadratic-result').should('contain', 'i')
    })
  })

  describe('Paid Features Tests', () => {
    it('should handle derivative calculations with credits', () => {
      // Test first derivative with insufficient credits
      cy.get('[data-tab="first-deriv"]').click()
      cy.get('#first-deriv-fx').type('x^2 + 3x')
      cy.get('#first-deriv button[type="submit"]').click()
      cy.get('#first-deriv-result').should('contain', 'Insufficient credits')

      // Add credits
      cy.addCredits()

      // Test first derivative
      cy.get('[data-tab="first-deriv"]').click()
      cy.get('#first-deriv-fx').type('x^2 + 3x')
      cy.get('#first-deriv button[type="submit"]').click()
      cy.get('#first-deriv-result').should('contain', '2x + 3')

      // Test second derivative
      cy.get('[data-tab="second-deriv"]').click()
      cy.get('#second-deriv-fx').type('x^3 - 2x^2 + x')
      cy.get('#second-deriv button[type="submit"]').click()
      cy.get('#second-deriv-result').should('contain', '6x - 4')
    })
  })

  describe('Payment System Tests', () => {
    it('should validate payment form', () => {
      cy.get('[data-tab="credits"]').click()

      // Test invalid inputs
      cy.get('#card-number').type('123')
      cy.get('#expiry-date').type('13/99')
      cy.get('#cvv').type('1')
      cy.get('#card-name').type('A')
      cy.get('#process-payment').click()
      cy.contains('Please enter a valid 16-digit').should('exist')
      cy.contains('valid expiry date').should('exist')
      cy.contains('valid 3-digit CVV').should('exist')
      cy.contains('name on your card').should('exist')
    })

    it('should process payment and add credits', () => {
      cy.addCredits()
      cy.get('#current-credits').should('contain', '60') // 10 initial + 50
    })
  })
})

// Custom command for adding credits
Cypress.Commands.add('addCredits', () => {
  cy.get('[data-tab="credits"]').click()
  cy.get('#card-number').type('4111111111111111')
  cy.get('#expiry-date').type('12/30')
  cy.get('#cvv').type('123')
  cy.get('#card-name').type('Test User')
  cy.get('#process-payment').click()
  cy.get('#process-payment').should('be.disabled')
  cy.wait(2000) // Wait for simulated payment processing
  cy.get('#current-credits').should('contain', '60')
})