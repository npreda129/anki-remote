describe('Flash card server, deck selection page', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it("renders a link to every deck", () => {
    cy.get('li')
      .should('be.visible')
  })
  
  describe('The user types and clears a search term', () => {
    const searchTerm = "Empty";
    it("hides the links to non-matching decks", () => {
      cy.get('input').type(searchTerm);
      cy.get(`li:contains("${searchTerm}")`)
        .should('not.be.hidden');
      cy.get(`li:not(:contains("${searchTerm}"))`)
        .should('be.hidden');

    });

    it("shows all links when the search clears", () => {
      cy.get('input').type(searchTerm);
      cy.get('input').clear();
      cy.get('li')
        .should('be.visible');
    })
  }) 
})
