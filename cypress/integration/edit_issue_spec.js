/// <reference types="Cypress" />
import { randomString, clickOnElement, clickOn, setTextOn, sidestep_login, clear } from './util'

describe('Codetree : Edit Issue Functionality Tests', () => {
    var random = randomString(4);
    var user;
    
    before(function () {
        cy.fixture('users.json').as('usersData');
        cy.get('@usersData').then((users) => {
            user = users.grp1Collaborator;
        })
    })

    beforeEach(function () {
        cy.server();
        sidestep_login(user.publicId);
        cy.get('.sidebar').should('be.visible');
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.route('GET', '/projects/*/issues/*/timeline.json').as('updateTitle');
        cy.route('POST', '/projects/*/issues').as('createIssue');
        cy.route('GET', '/projects/*/cards/*?filter={}').as('verifyCreateIssue');
    })

    it('verify fields at edit issue window EDISSU_001', () => {
        cy.contains('Add Issue').click();
        cy.wait(400);
        cy.get('#title').type("Test Issue " + random);
        cy.get('textarea#body').first().type('needs 123');
        cy.contains('Create Issue').click();
        cy.wait('@createIssue');
        cy.get('button.issue-form-command').click();
        cy.wait('@verifyCreateIssue');
        cy.get('div.flash-tab-container div').last().should('contain', 'Issue created:').and('contain', random)
        cy.get('div[data-id="backlog"] h3.board-card-title').first().should('contain', random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('button.issue-form-command .octicon-pencil').should((btn) => {
            expect(btn, 'Pencil icon for edit ').to.be.visible;
        })
        cy.get('button.button').last().should('contain', 'Comment').and('be.disabled');
    })

    it('verify popup message by put blank issue title EDISSU_004', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('button.issue-form-command .octicon-pencil').click();
        cy.get('.issue-title-editor #title').as('inputTextTitle');
        cy.get('button[data-behavior="update-title"]').as('saveButton');
        cy.get('@saveButton').should((btn) => {
            expect(btn, 'Save button').to.be.enabled;
        })
        cy.get('.issue-title-editor button[data-behavior="toggle-title"]').should((btn) => {
            expect(btn, 'Cancel Button').to.be.enabled;
        })
        cy.get('@inputTextTitle').should('contain.value', random).clear();
        cy.get('@inputTextTitle').should('contain.value', '')
        cy.get('@saveButton').click();
        cy.get('div.flash-tab-container div').first().should('contain', 'We had a problem saving data for');
    })

    it('verify editing issue functionality for updating title to cancel button EDISSU_003', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);

        cy.get('.issue-form-title').then((title) => {
            cy.get('button.issue-form-command .octicon-pencil').click();
            cy.get('.issue-title-editor #title').as('inputTextTitle');
            cy.get('.issue-title-editor button[data-behavior="toggle-title"]').as('cancelButton');
            cy.get('@inputTextTitle').should('contain.value', random)
            cy.get('@cancelButton').click();
            cy.get('.issue-form-title').should('contain', title.text())
        })
    })

    it('verify editing issue functionality for updating title to save button EDISSU_002', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('button.issue-form-command .octicon-pencil').click();
        cy.get('.issue-title-editor #title').as('inputTextTitle');
        cy.get('button[data-behavior="update-title"]').as('saveButton');
        cy.get('@inputTextTitle').should('contain.value', random).clear();
        cy.get('@inputTextTitle').should('contain.value', '')
        cy.get('@inputTextTitle').type("Update Issue " + random);
        cy.get('@saveButton').click();
        cy.get('.issue-form-title').should('contain', "Update Issue " + random)
    })

    it('verify editing issue functionality for updating description to cancel button EDISSU_005 EDISSU_007', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('div[data-section="body"]').last().within(() => {
            cy.get('div.timeline-node-body p').should('contain', 'needs 123')
            cy.get('.timeline-node-header .comment-controls').click();
        })
        cy.get('button[data-behavior="toggle-composer"]').as('cancelButton').should('be.enabled')
        cy.get('@cancelButton').click();
        cy.get('div[data-section="body"]').last().within(() => {
            cy.get('div.timeline-node-body p').should('contain', 'needs 123')
        })
    })

    it('verify editing issue functionality for updating description to update comment button EDISSU_005 EDISSU_015', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('div[data-section="body"]').last().within(() => {
            cy.get('div.timeline-node-body p').should('contain', 'needs 123')
            cy.get('.timeline-node-header .comment-controls').click();
        })
        cy.get('button[data-behavior="update-body"]').as('updateComment').should('be.enabled')
        cy.get('textarea#body').last().clear().should('have.value', '').type('needs 456');
        cy.get('@updateComment').click();
        cy.wait('@verifyCreateIssue')
        cy.get('div[data-section="body"]').last().within(() => {
            cy.get('div.timeline-node-body p').should('contain', 'needs 456')
        })

    })
})