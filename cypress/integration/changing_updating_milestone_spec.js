/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'
const MilestonePage = new (require('../pages/MilestonePage'))();

describe('Codetree : Changing, Updateing And Deleting Milestones functionality Tests', () => {
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
        clickOn('//span[contains(text(),"Milestones")]')
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')
        cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyMilestoneView');
        cy.get('table[data-container="milestones"]').first().as('openMilestones')
        cy.get('table[data-container="milestones"]').last().as('closeMilestones')
        cy.route('POST', '/projects/*/issues').as('createIssue');
        cy.route('GET', '/projects/*/cards/*?filter={}').as('verifyCreateIssue');
        cy.route("GET", '/projects/*/cards/*?filter={"type":"epic"}').as('verifyEpic');
        cy.route('GET', 'projects/*/views?type=epic&include_counts=true&scope=issues&view_type=boards').as('addEpics');
        cy.route('GET', '/projects/*/issues/*/edit').as('editIssue');
        cy.route('POST', '/projects/*/issues/*').as('moveIssueDone');

    })
    after(function () {
        cy.get('.sidebar-nav a').first().click()
        cy.get('h3.board-card-title').contains(random).click({ force: true });
        cy.route('GET', '/projects/*/issues/*/*').as('editIssue');
        cy.wait('@editIssue');
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('button.issue-form-status').should('contain', 'Open').click();
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyCreateIssue');
    })
    context('At Open Milestone Window', () => {

        it('verify created milestone have hamburger, setting, progress bar, due date and View Task Board CHGMIL_001', () => {
            MilestonePage.createMilestone(random);
            cy.get('th.group-header').should(($th) => {
                expect($th.first().text(), 'Hearder : Open Milestones').to.contains('Open Milestones');
                expect($th.last().text(), 'Hearder : Closed Milestones').to.contains('Closed Milestones');
            });
            cy.get('tr[data-item="milestone"]').within(() => {
                cy.get('td.col-handle').should('be.visible');
                cy.get('td.col-settings').should('be.visible');
                cy.get('td.col-due-on').should('be.visible');
                cy.get('div.progress-bar').should('be.visible');
                cy.get('td.col-controls').should('contain', 'View Task Board');
            });
        })
        it('verify created milestone page for Milestone list view to Percent completion navigation bar CHGMIL_002', () => {

            cy.get('@openMilestones').within(() => {
                cy.get('td.col-progress-summary span a').last().click();
            })
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/burndowns/')
            cy.get('h2').should('contain', "Burndowns")
        })
        it('verify new created milestone not assinged to any issue in both List and Board view CHGMIL_003', () => {
            cy.get('@openMilestones').within(() => {
                cy.get('td.col-milestone a').contains(random).parent().siblings('td.col-controls').click();
            })
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
            cy.get('.board-card-details').should('have.length', '0');
            clickOn('a#filter-format');
            clickOn('input[value="list"]');
            cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
            cy.get('tr[data-item="issue"]').should('have.length', '0');
        })

        it('verify created milestone add in create issue functionality CHGMIL_004', () => {
            cy.contains('Add Issue').click();
            cy.wait(400);
            cy.get('#title').type("Test Issue " + random);
            clickOnElement('a.issue-form-milestone-menu-toggle .octicon', "last");
            cy.get('.issue-form-milestone-menu .dropdown-menu .menu-item-filter .text-field').last().type(random);
            cy.get('.issue-form-milestone-menu .dropdown-menu ul li').contains(random).click();
            cy.get('a.issue-form-milestone-menu-toggle .title').should('contain', random);
            cy.contains('Create Issue').click();
            cy.wait('@createIssue');
            clickOn('button.issue-form-command');
            clickOn('//a/span[contains(text(),"Issues")]');
            cy.get('div[data-id="backlog"] h3.board-card-title').contains(random).parent().find('ul.issue-labels li').should('contain', random);
        })

        it('verify created milestone close and reopen again functionality CHGMIL_005 CHGMIL_006', () => {
            MilestonePage.closeMilestone(random);
            MilestonePage.reopenMilestone(random);
        })

        it('verify created milestone edit title successfully CHGMIL_005 CHGMIL_007', () => {
            MilestonePage.editMilestone(random, 'openMilestone');
        })
        it('verify created milestone delete successfully CHGMIL_005 CHGMIL_008', () => {
            MilestonePage.deleteMilestone(random, 'openMilestone');
        })
    })
}) 