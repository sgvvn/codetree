/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from '../integration/util'

class LabelPage {

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