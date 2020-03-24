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
        cy.route('GET', '/projects/*/cards/*').as('verifyCreateIssue');
        cy.route('GET','/projects/*/cards/*?filter={}').as('verifyLabel')
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

    it('verify editing issue functionality for updating issue by add comment EDISSU_015', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('textarea[name="comment[body]"]').type('Add comment test');
        cy.get('button.button').last().should('contain', 'Comment').and('be.enabled').click();
        cy.get('div.issue-form-comments div.timeline-node-body').should('be.visible').and('contain', 'Add comment test')
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
        cy.get('button[data-behavior="toggle-composer"]').first().as('cancelButton').should('be.enabled')
        cy.get('@cancelButton').click();
        cy.get('div[data-section="body"]').last().within(() => {
            cy.get('div.timeline-node-body p').should('contain', 'needs 123')
        })
    })

    it('verify editing issue functionality for updating description to update comment button EDISSU_005 EDISSU_006', () => {
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

    it('verify editing issue functionality for updating milestone by "DND 1" EDISSU_009', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        clickOnElement('a.issue-form-milestone-menu-toggle .octicon', "last");
        cy.get('.issue-form-milestone-menu .dropdown-menu .menu-item-filter .text-field').last().type('DND 1');
        cy.get('.issue-form-milestone-menu .dropdown-menu ul li.nav-focus').contains('DND 1').click();
        cy.get('a.issue-form-milestone-menu-toggle .title').should('contain', 'DND 1');
        cy.wait('@verifyCreateIssue');
        clickOnElement('button.issue-form-command', 'last');
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('ul.issue-labels li').should('contain', 'DND 1');
    })

    it('verify editing issue functionality for updating Label by "enhancement" EDISSU_014', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        clickOnElement('div.octicon-wrapper .octicon', "last");
        cy.get('input[value="enhancement"]').last().click();
        cy.get('ul[class="issue-labels issue-form-labels"] li').should('contain', 'enhancement');
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyLabel');
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('ul.issue-labels li').should('contain', 'enhancement');
    })

    it('verify editing issue functionality for updating assignees EDISSU_012', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        clickOnElement('a.assignees-gear-link', 'last');
        cy.get('span.username').last().should('contain', user.name).click()
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyCreateIssue');
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('span.board-card-assignee').should("have.attr", "data-original-title", "Assigned to " + user.name);
    })

    it('verify editing issue functionality for updating epic EDISSU_008', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        clickOnElement('a.epic-gear-link', 'last');
        cy.get('div[class="dropdown-menu epic-menu"] input[class="text-field small"]').last().type('EPIC Test Data DND')
        cy.get('li.checkable-item.nav-focus').last().should('contain', 'EPIC Test Data DND').click()
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyCreateIssue');
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('div.issue-epic span').should('contain', 'EPIC Test Data DND');
    })

    it('verify editing issue functionality for updating priority EDISSU_010', () => {
        cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        clickOnElement('button.issue-form-priority-button', "last");
        cy.wait('@verifyCreateIssue');
        clickOnElement('button.issue-form-command', 'last');
        cy.get('div[data-id="backlog"] h3.board-card-title').last().should('contain', random);
    })

    it('verify editing issue functionality for updating stage by "in-progress" EDISSU_013', () => {
        cy.get('h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.xpath('//a[@class="issue-form-stage-menu-toggle"]').last().click({ force: true });
        cy.xpath('//input[@id="stage_in_progress"]').last().click();
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyCreateIssue');
        cy.get('div[data-id="qh6H"] h3.board-card-title').should('contain', random);
    })

    it('verify editing issue functionality for updating issue by "close" EDISSU_011', () => {
        cy.get('h3.board-card-title').contains(random).click();
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('button.issue-form-status').should('contain', 'Open').click();
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyCreateIssue');
    })
})