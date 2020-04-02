/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'
const MilestonePage = new (require('../pages/MilestonePage'))();

describe('Codetree : Board View Tests', () => {
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
        cy.location('pathname').then((loc) => {
            if (loc == '/projects/' + user.projectId + '/issues') {
                clickOn('a#filter-format');
                clickOn('input[value="board"]');
                cy.route('GET', '/projects/*/views?include_counts=true&scope=issues&view_type=board').as('verifyBoardView');
                cy.wait('@verifyBoardView');
            }
        })
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
    })

    it('verify issues filtered by selected milestone only MIBV_004', () => {
        clickOn('//span[contains(text(),"Milestones")]')
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')
        MilestonePage.createMilestone(random)
        cy.xpath('//a/span[contains(text(),"Issues")]').click();
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.contains('Add Issue').click();
        cy.wait(400);
        cy.get('#title').type("Test Issue " + random);
        clickOnElement('a.issue-form-milestone-menu-toggle .octicon', "last");
        cy.get('.issue-form-milestone-menu .dropdown-menu .menu-item-filter .text-field').last().type(random);
        cy.get('.issue-form-milestone-menu .dropdown-menu ul li').contains(random).click();
        cy.get('a.issue-form-milestone-menu-toggle .title').should('contain', random);
        cy.contains('Create Issue').click();
        cy.route('GET', '/projects/*/cards/*?filter={}').as('createIssue');
        cy.wait('@createIssue');
        clickOn('button.issue-form-command');

        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="milestone"]').click()
        cy.get('[data-name="milestone"]  .dropdown  .dropdown-menu').within(()=>{
            cy.get('.menu-item-filter .text-field').type(random);
            cy.get('ul[data-custom-sort="milestone"] li[class="checkable-item nav-focus"] input[type="checkbox"]').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET','/projects/*/views?milestone=*&include_counts=true&scope=issues&view_type=boards').as('verifyMilestonefilter')
        cy.wait('@verifyMilestonefilter');
        cy.get('.issue-milestone').each(($el) => {
              cy.wrap($el).invoke('text').should('contain', random)
        })
    })

    it('verify issues filtered by selected label only MIBV_005', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="labels"]').click()
        cy.get('[data-name="labels"]  .dropdown  .dropdown-menu').within(()=>{
            cy.get('.menu-item-filter .text-field').type('Test Label DND');
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET','/projects/*/views?labels=Test+Label+DND&include_counts=true&scope=issues&view_type=boards').as('verifyLabelFilter')
        cy.wait('@verifyLabelFilter')
        cy.get('.issue-label').each(($el) => {
              cy.wrap($el).invoke('text').should('equal', 'Test Label DND')
        })
    })

    it('verify issues filtered by selected epic only MIBV_006', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="epic"]').click()
        cy.get('[data-name="epic"]  .dropdown  .dropdown-menu').within(()=>{
            cy.get('.menu-item-filter .text-field').type('EPIC Test Data DND');
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET','/projects/*/views?epic=EPIC+Test+Data+DND+&include_counts=true&scope=issues&view_type=boards').as('verifyEpicFilter')
        cy.wait('@verifyEpicFilter')
        cy.get('.epic-name').each(($el) => {
              cy.wrap($el).invoke('text').should('equal', 'EPIC Test Data DND ')
        })
    })

})