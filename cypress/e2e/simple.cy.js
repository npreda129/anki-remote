describe('Flash card server', () => {
  // Happy PATH
  describe('normal study session', () => {
    it("renders a card from the deck.", () => {
      cy.visit('/review/Deadlock');
      cy.get('[id="front"]')
        .should('be.visible')
    })
  })
})
