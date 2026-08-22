/**
 * E2E tests for the Anki flash card web server.
 *
 * SELECTORS: every `[data-cy=...]` below is a placeholder. Add matching
 * data-cy attributes to your markup, or swap in your real selectors.
 *
 * ROUTES: replace '/api/cards' etc. with whatever your Node server exposes.
 */

describe('Flash card server', () => {

  // ---------------------------------------------------------------
  // 1. HAPPY PATH — does the core thing work at all?
  // ---------------------------------------------------------------
  describe('normal study session', () => {

    beforeEach(() => {
      cy.visit('/');
    });

    it('renders a card from the deck', () => {
      cy.get('[data-cy=card-front]')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('reveals the answer when prompted', () => {
      // Answer should be hidden first — a card that leaks its own answer
      // is a real bug, and an easy one to ship.
      cy.get('[data-cy=card-back]').should('not.exist');

      cy.get('[data-cy=show-answer]').click();

      cy.get('[data-cy=card-back]')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('advances to a new card after grading', () => {
      cy.get('[data-cy=card-front]')
        .invoke('text')
        .then((firstCard) => {
          cy.get('[data-cy=show-answer]').click();
          cy.get('[data-cy=grade-good]').click();

          cy.get('[data-cy=card-front]')
            .should('be.visible')
            .and('not.have.text', firstCard);
        });
    });
  });

  // ---------------------------------------------------------------
  // 2. THE ANKI BOUNDARY — the interesting failures
  //
  // cy.intercept() stubs requests the BROWSER makes. If your Node
  // server talks to Anki server-side, you're stubbing your own API
  // here, not AnkiConnect. That's still the right layer: it tests how
  // the front end handles a backend that is failing or behaving oddly.
  // ---------------------------------------------------------------
  describe('when the backend misbehaves', () => {

    it('shows an error instead of hanging when Anki is unreachable', () => {
      cy.intercept('GET', '/api/cards', {
        statusCode: 503,
        body: { error: 'Could not reach Anki' },
      }).as('cardsDown');

      cy.visit('/');
      cy.wait('@cardsDown');

      cy.get('[data-cy=error-message]')
        .should('be.visible')
        .and('contain.text', 'Anki');

      // No infinite spinner.
      cy.get('[data-cy=loading]').should('not.exist');
    });

    it('handles an empty deck without breaking', () => {
      cy.intercept('GET', '/api/cards', { body: { cards: [] } }).as('empty');

      cy.visit('/');
      cy.wait('@empty');

      cy.get('[data-cy=empty-state]').should('be.visible');
      cy.get('[data-cy=card-front]').should('not.exist');
    });

    it('survives a slow response', () => {
      cy.intercept('GET', '/api/cards', (req) => {
        req.reply({ delay: 3000, fixture: 'cards.json' });
      }).as('slow');

      cy.visit('/');

      // Something should tell the user it is working.
      cy.get('[data-cy=loading]').should('be.visible');

      cy.wait('@slow');
      cy.get('[data-cy=card-front]').should('be.visible');
    });

    it('does not lose the session when a grade submission fails', () => {
      cy.visit('/');

      cy.intercept('POST', '/api/answer', {
        statusCode: 500,
        body: { error: 'Anki rejected the update' },
      }).as('gradeFails');

      cy.get('[data-cy=show-answer]').click();
      cy.get('[data-cy=grade-good]').click();
      cy.wait('@gradeFails');

      // The card should NOT silently advance as if it were recorded.
      cy.get('[data-cy=error-message]').should('be.visible');
    });
  });

  // ---------------------------------------------------------------
  // 3. CONTENT EDGE CASES — Anki fields are arbitrary HTML
  // ---------------------------------------------------------------
  describe('unusual card content', () => {

    it('renders a card containing HTML markup', () => {
      cy.intercept('GET', '/api/cards', {
        body: {
          cards: [{
            id: 1,
            front: '<b>bold</b> &amp; <i>italic</i> &lt;script&gt;',
            back: 'answer',
          }],
        },
      });

      cy.visit('/');
      cy.get('[data-cy=card-front]').should('be.visible');
      // Assert on what you INTEND: rendered markup, or escaped text.
      // Pick one and pin it down here.
    });

    it('does not overflow on a very long card', () => {
      cy.intercept('GET', '/api/cards', {
        body: {
          cards: [{ id: 1, front: 'word '.repeat(400), back: 'answer' }],
        },
      });

      cy.visit('/');
      cy.get('[data-cy=show-answer]').should('be.visible');

      // No horizontal scrollbar on the document.
      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth)
          .to.be.at.most(doc.documentElement.clientWidth);
      });
    });
  });

  // ---------------------------------------------------------------
  // 4. MOBILE — the reason the project exists
  // ---------------------------------------------------------------
  describe('on a phone viewport', () => {

    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.visit('/');
    });

    it('fits the screen without horizontal scrolling', () => {
      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth)
          .to.be.at.most(doc.documentElement.clientWidth);
      });
    });

    it('gives grading buttons a usable tap target', () => {
      cy.get('[data-cy=show-answer]').click();

      // ~44px is the common minimum for a comfortable touch target.
      cy.get('[data-cy^=grade-]').each(($btn) => {
        expect($btn.height()).to.be.at.least(44);
      });
    });

    it('keeps controls reachable without scrolling past the card', () => {
      cy.get('[data-cy=show-answer]').should('be.visible');
    });
  });
});
