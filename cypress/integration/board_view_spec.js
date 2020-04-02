/// <reference types="Cypress" />
import { randomString, clickOn, setTextOn, clickOnElement, clear, sidestep_login } from './util'
const MilestonePage = new (require('../pages/MilestonePage'))();
const LabelPage = new (require('../pages/LabelPage'))();
const EpicPage = new (require('../pages/EpicPage'))();

describe('Codetree : Board View Tests', () => {
    var random;
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
         random = randomString(4);
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.route('GET', '/projects/*/cards/*?filter={}').as('createIssue');
        cy.route('GET','/projects/*/views?include_counts=true&scope=labels&view_type=').as('verifydeletlabel');
        cy.route("GET", '/projects/*/board?type=epic&_pjax=[data-pjax-container]').as('addEpics');
        cy.route('GET', '/projects/*/cards/*').as('verifyEpic');
    })
    afterEach(function () {
        cy.xpath('//a/span[contains(text(),"Issues")]').click();
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.wait(1000)
        cy.get('h3.board-card-title').contains(random).click({ force: true });
        cy.wait(400)
        cy.get('span.issue-form-title').should('contain', random);
        cy.get('button.issue-form-status').should('contain', 'Open').click();
        clickOnElement('button.issue-form-command', 'last');
        cy.wait('@verifyEpic');
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
        cy.wait('@verifyEpic');
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
        clickOn('//span[contains(text(),"Milestones")]')
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')
        MilestonePage.deleteMilestone(random, 'openMilestone');
    })

    it('verify issues filtered by selected label only MIBV_005', () => {
        clickOn('//span[contains(text(),"Labels")]');
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/labels')
        setTextOn('input[name="name"]', "Test Label " + random);
        clickOn('div.color-preview');
        setTextOn('div.color-value-wrapper input[type="text"]', "#eb6420");
        cy.get('input[value="Add label"]').should('be.enabled').click();
        cy.get('tbody tr td.col-name').should('contain', random);

        cy.xpath('//a/span[contains(text(),"Issues")]').click();
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.contains('Add Issue').click();
        cy.wait(400);
        cy.get('#title').type("Test Issue " + random);
        clickOnElement('div.octicon-wrapper .octicon', "first");
        setTextOn('div.label-menu input.text-field', random)
        cy.get('span.label-menu-label').contains(random).parent().prev('input').click();
    cy.get('ul[class="issue-labels issue-form-labels"] li').should('contain',random);
    cy.contains('Create Issue').click();
    cy.wait('@verifyEpic');
    clickOn('button.issue-form-command');
    clickOn('//a/span[contains(text(),"Issues")]');
    cy.wait('@verifyEpic');
    cy.wait(400)
        cy.contains('+ Add a filter').click();   
        cy.get('label[data-filter="labels"]').click()
        cy.get('[data-name="labels"]  .dropdown  .dropdown-menu').within(()=>{
            cy.get('.menu-item-filter .text-field').type(random);
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET','/projects/*/views?labels=*&include_counts=true&scope=issues&view_type=boards').as('verifyLabelFilter')
        cy.wait('@verifyLabelFilter')
        cy.get('.issue-label').each(($el) => {
              cy.wrap($el).invoke('text').should('contain', random)
        })

        LabelPage.deleteLabel(random);
    })

    it('verify issues filtered by selected epic only MIBV_006', () => {
    clickOn('//span[contains(text(),"Epics")]');
    cy.wait('@addEpics');
        EpicPage.createEpic(random)
        cy.wait('@saveEpic')
        cy.xpath('//a/span[contains(text(),"Issues")]').click();
        cy.route('GET','/projects/*/views?include_counts=true&scope=issues&view_type=boards').as('boardview')
        cy.wait('@boardview');
        cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
        cy.contains('Add Issue').click();
        cy.wait(600);
        cy.get('#title').type("Test Issue " + random);
        clickOnElement('a.epic-gear-link', 'last');
        cy.get('div[class="dropdown-menu epic-menu"] input[class="text-field small"]').last().type(random)
        cy.get('ul[data-custom-sort="epic"] li.checkable-item.nav-focus').first().should('contain', random).click()
        cy.contains('Create Issue').click();
        cy.wait('@verifyEpic');
        cy.get('button.issue-form-command').click(); 
        cy.xpath('//a/span[contains(text(),"Issues")]').click();
        cy.wait('@verifyEpic')
        cy.wait(500)
        cy.contains('+ Add a filter').click();
        cy.get('label[data-filter="epic"]').click()
        cy.get('[data-name="epic"]  .dropdown  .dropdown-menu').within(()=>{
            cy.get('.menu-item-filter .text-field').type(random);
            cy.get('ul .nav-focus label input').click();
            cy.get('.filter-button-container .button').click();
        })
        cy.route('GET','/projects/*/views?epic=*&include_counts=true&scope=issues&view_type=boards').as('verifyEpicFilter')
        cy.wait('@verifyEpic');
        cy.wait(1000)
        cy.get('.epic-name').each(($el) => {
         cy.wrap($el).invoke('text').should('contain', random)
        })
        clickOn('//span[contains(text(),"Epics")]');
        cy.wait('@addEpics');
        EpicPage.closeEpic(random)
       
    })

})