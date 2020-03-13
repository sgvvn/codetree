/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'


describe('Codetree : List View Tests', () => {
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
            if (loc == '/projects/' + user.projectId + '/board') {
                clickOn('a#filter-format');
                clickOn('input[value="list"]');
                cy.route('GET', '/projects/*/views?include_counts=true&scope=issues&view_type=issues').as('verifyListView');
                cy.wait('@verifyListView');
            }
        })
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
    })

    it('verify issues filtered by selected milestone only MIBV_004', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="milestone"]').click()
        cy.get('[data-name="milestone"]  .dropdown  .dropdown-menu').within(() => {
            cy.get('.menu-item-filter .text-field').type('Test data DND 1');
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET', '/projects/*/views?milestone=Test+data+DND+1&include_counts=true&scope=issues&view_type=issues').as('verifyMilestonefilter')
        cy.wait('@verifyMilestonefilter');
        cy.xpath('//div[@class="issue-group"]//th[@class="group-header"]//a[1]').each(($el) => {
            cy.wrap($el).invoke('text').should('equal', 'Test data DND 1')
        })
    })

    it('verify issues filtered by selected label only MIBV_005', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="labels"]').click()
        cy.get('[data-name="labels"]  .dropdown  .dropdown-menu').within(() => {
            cy.get('.menu-item-filter .text-field').type('Test Label DND');
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET', '/projects/*/views?labels=Test+Label+DND&include_counts=true&scope=issues&view_type=issues').as('verifyLabelFilter')
        cy.wait('@verifyLabelFilter')
        cy.get('.issue-label').each(($el) => {
            cy.wrap($el).invoke('text').should('equal', 'Test Label DND')
        })
    })

    it('verify issues filtered by selected epic only MIBV_006', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="epic"]').click()
        cy.get('[data-name="epic"]  .dropdown  .dropdown-menu').within(() => {
            cy.get('.menu-item-filter .text-field').type('EPIC Test Data DND');
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET', '/projects/*/views?epic=EPIC+Test+Data+DND+&include_counts=true&scope=issues&view_type=issues').as('verifyEpicFilter')
        cy.wait('@verifyEpicFilter')
        cy.get('.issue-epic-col').each(($el) => {
            cy.wrap($el).invoke('text').should('contain', 'EPIC Test Data DND ')
        })
    })

    it.only('verify issues filtered by assignee MIBV_006', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="assignee"]').click()
        cy.get('[data-name="assignee"]  .dropdown  .dropdown-menu').within(() => {
            cy.get('.menu-item-filter .text-field').type(user.name);
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET', '/projects/*/views?assignee='+user.name+'&include_counts=true&scope=issues&view_type=issues').as('verifyAssigneeFilter')
        cy.wait('@verifyAssigneeFilter')
        cy.get('.assignee .name').each(($el) => {
            cy.wrap($el).invoke('text').should('contain',user.name)
        })
    })

})