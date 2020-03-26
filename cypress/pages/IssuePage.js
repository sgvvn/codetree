import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from '../integration/util'

class IssuePage {

    createIssue(title) {
      cy.server();
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + title);
      cy.contains('Create Issue').click();
      cy.wait('@createIssue');
      cy.get('button.issue-form-command').click();
    }
   closeIssue(title){
      cy.get('div[data-id="-"] div.issue-title').contains(title).click({ force: true });
      cy.wait(400)
      cy.get('span.issue-form-title').should('contain', title);
      cy.get('button.issue-form-status').should('contain', 'Open').click();
      clickOnElement('button.issue-form-command', 'last');
    }
   
}
module.exports = IssuePage;