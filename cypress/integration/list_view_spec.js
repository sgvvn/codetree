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
        cy.route('GET', '/projects/*/views?include_counts=true&scope=issues&view_type=board').as('verifyBoardView');
        cy.route('GET', '/projects/*/views?sort_by_type=create&include_counts=true&scope=issues&view_type=issues').as('verifyDateView')
        cy.route('GET', '/projects/*/views?sort_by_type=update&include_counts=true&scope=issues&view_type=issues').as('verifyUpdateView')
    })

    it('verify showing list and board view MITV_001', () => {
        cy.get('span[data-name="format"] span a').click();
        cy.xpath('//span[contains(text(),"Task Board")]').should('be.visible').click()
        cy.wait(1200);
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.get('span[data-name="format"] span a').click();
        cy.xpath('//span[contains(text(),"List")]').should('be.visible').click()
        cy.wait('@verifyListView')
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
    })

    it('verify list view showing all type of issue MITV_002', () => {
        cy.get('a#filter-status').last().click();
        cy.xpath('//div[contains(text(),"All")]').click();
        cy.get('a#filter-status').should('contain', 'issues & pull requests & epics')
    })

    it('verify list view showing issues closed only MITV_003', () => {
        cy.get('a#filter-status').last().click();
        cy.xpath('//div[contains(text(),"Issues Only")]').click();
        cy.get('a#filter-status').should('contain', 'issues')
        cy.get('a#filter-status').first().as('filterIssue');
        cy.get('@filterIssue').click();
        cy.xpath('//div[contains(text(),"Closed")]').last().click();
        cy.route('GET', '/projects/*/views?status=*&include_counts=true&scope=issues&view_type=issues').as('verifyFilter')
        cy.wait('@verifyFilter');
        cy.get('.issue-stage .name').each(($el) => {
            cy.wrap($el).invoke('text').should((texts) => {
                expect(texts.trim()).contain('Done')
            });
        })
    })

    it('verify list view showing epics only MITV_004', () => {
        cy.get('a#filter-status').last().click();
        cy.xpath('//div[contains(text(),"Epics Only")]').click();
        cy.get('a#filter-status').should('contain', 'epics')
        cy.get('.issue-title').should('contain', 'EPIC Test Data DND');
    })

    it('verify to view ticket with Manual only MITV_005', () => {
        cy.get('#add-sorting-toggle').click();
        cy.get('input[value="manual"]').should('be.checked')
    })

    it('verify showing list of issue shorted by date created assending only MITV_006', () => {
        cy.get('#add-sorting-toggle').click();
        cy.get('input[data-label="create"]').click();
        cy.get('button[data-behavior="apply-sorting"]').click();
        cy.wait('@verifyDateView')
        cy.get('#add-sorting-toggle').should('contain', 'Date Created (asc)')
    })

    it('verify showing list of issue shorted by last updated assending only MITV_007', () => {
        cy.get('#add-sorting-toggle').click();
        cy.get('input[data-label="update"]').click();
        cy.get('button[data-behavior="apply-sorting"]').click();
        cy.wait('@verifyUpdateView')
        cy.get('#add-sorting-toggle').should('contain', 'Last Updated (asc)')
    })

    it('verify saved view and delete MITV_008', () => {
        filterByMilestone();
        cy.get('[data-component="new-shortcut"] .dropdown #add-filter-toggle').click()
        cy.get('.dropdown-menu > .shortcut-name').type('Milestone DND 1 Only');
        cy.get('.dropdown-menu > .button').click()
        cy.wait('@verifyMilestonefilter');
        cy.get('.sidebar-nav a').should('contain','Milestone DND 1 Only')
        cy.xpath('//div[@class="issue-group"]//th[@class="group-header"]//a[1]').each(($el) => {
            cy.wrap($el).invoke('text').should('equal', 'Test data DND 1')
        })
        cy.get('.sidebar-heading span').click();
        cy.get('.sidebar-heading div ul li').last().click();
        cy.xpath('//a[contains(text(),"Views")]').click()
        cy.get('button[data-behavior="delete"]').each(($deleteButton)=>{
            $deleteButton.click()
        })
    })

    it('verify Clear option from the filter in list view MITV_009', () => {
        cy.get('a#filter-status').last().click();
        cy.xpath('//div[contains(text(),"All")]').click();
        cy.get('a#filter-status').should('contain', 'issues & pull requests & epics')
        cy.xpath('//div[@data-component="issue-filter"]//a[contains(text(),"Clear")]').click();
        cy.get('a#filter-status').should('not.contain', 'issues & pull requests & epics')
    })

    it('verify issues filtered by selected epic only MITV_010', () => {
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

    it('verify issues filtered by selected milestone only MITV_011', () => {
        filterByMilestone();
    })

    it('verify issues filtered by selected assignee MITV_012', () => {
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="assignee"]').click()
        cy.get('[data-name="assignee"]  .dropdown  .dropdown-menu').within(() => {
            cy.get('.menu-item-filter .text-field').type(user.name);
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET', '/projects/*/views?assignee=' + user.name + '&include_counts=true&scope=issues&view_type=issues').as('verifyAssigneeFilter')
        cy.wait('@verifyAssigneeFilter')
        cy.get('.assignee .name').each(($el) => {
            cy.wrap($el).invoke('text').should('contain', user.name)
        })
    })

    it('verify issues filtered by selected label only MITV_013', () => {
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

    function filterByMilestone() {
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
    }
})