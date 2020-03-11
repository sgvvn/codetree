import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from '../integration/util'

class EpicPage {

    createEpic(title) {
        cy.server();
        cy.route("GET", '/projects/*/issues/*.json?filter={"type":"epic"}&type=epic').as('verifyEpic');
        clickOn('button.add-issue-carat');
        clickOn('a[data-component="new-epic-controls"]');
        cy.wait(300);
        setTextOn('input.new-title-field', "Test Epic " + title);
        clickOn('button[data-behavior="create-issue"]');
        cy.route('GET', '/projects/*/cards/*?filter={"type":"epic"}').as('saveEpic')
        cy.wait('@saveEpic')
        cy.get('div[class="flash-tab-container"] div').should('contain', "Epic created");
        cy.get('button.issue-form-command').last().click();
    }
    closeEpic(title) {
        cy.get('h3.board-card-title').contains(title).click();
        cy.get('span.issue-form-title').should('contain', title);
        cy.get('button.issue-form-status').should('contain', 'Open')
        cy.get('button.issue-form-status').click();
        cy.get('button.issue-form-command').last().click();
    }
}
module.exports = EpicPage;