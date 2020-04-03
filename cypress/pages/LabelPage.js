/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from '../integration/util'
var user;
before(function () {
  cy.fixture('users.json').as('usersData');
  cy.get('@usersData').then((users) => {
    user = users.grp1Collaborator;
  })
})
class LabelPage {
        
createLabel(random){
        clickOn('//span[contains(text(),"Labels")]');
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/labels')
        setTextOn('input[name="name"]', "Test Label " + random);
        clickOn('div.color-preview');
        setTextOn('div.color-value-wrapper input[type="text"]', "#eb6420");
        cy.get('input[value="Add label"]').should('be.enabled').click();
        cy.get('tbody tr td.col-name').should('contain', random);
}

deleteLabel(random) {
clickOn('//span[contains(text(),"Labels")]');
cy.get('.col-name a').contains(random).parent().next('td').children().last().as('deleteButton')
cy.get('@deleteButton').click();
cy.wait('@verifydeletlabel');
cy.get('div.flash-tab-container div').last().should('contain', 'Label deleted')
cy.get('tbody tr td.col-name').should('not.contain', random);
}



}

module.exports = LabelPage;