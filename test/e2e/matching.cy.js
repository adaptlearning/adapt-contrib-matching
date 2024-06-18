describe('Matching', function () {
  beforeEach(function () {
    cy.getData();
    cy.visit('/');
  });

  it('should display the matching component', function () {
    const matchingComponents = this.data.components.filter(component => component._component === 'matching');
    const stripHtml = cy.helpers.stripHtml;
    matchingComponents.forEach(matchingComponent => {
      cy.visit(`/#/preview/${matchingComponent._id}`);
      cy.testContainsOrNotExists('.matching__body', stripHtml(matchingComponent.body));
      cy.testContainsOrNotExists('.matching__title', stripHtml(matchingComponent.displayTitle));
      cy.testContainsOrNotExists('.matching__instruction', stripHtml(matchingComponent.instruction));

      cy.get('.matching-item.item').should('have.length', matchingComponent._items.length);
      matchingComponent._items.forEach((item, index) => {
        cy.get('.matching-item.item ').eq(index).within(() => {
          cy.get('button.dropdown__btn').click();
          cy.get('li.dropdown-item').should('have.length', item._options.length);
          cy.get('button.dropdown__btn').click();
        });
      });

      // Make sure the current component is tested before moving to the next one
      // Custom cypress tests are async so we need to wait for them to pass first
      cy.wait(1000);
    });
  });
});