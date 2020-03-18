/// <reference types="Cypress" />

import { randomString, clickOnElement, clickOn, sidestep_login } from './util'

describe('Add Issue Functionality Tests', () => {
  var random;
  var user;
  before(function () {
    cy.fixture('users.json').as('usersData');
    cy.get('@usersData').then((users) => {
      user = users.grp1Collaborator;
    })
  })

  beforeEach(function () {
    random = randomString(4);
    cy.server();
    sidestep_login(user.publicId);
    cy.get('.sidebar').should('be.visible');
  })

  it('verify fields at create issue window #CRISU_001 #CRISU_003', () => {
      cy.contains('Add Issue').click();
      cy.get('#title').should('be.visible');
      cy.get('span.username').should('be.visible');
      cy.get('span[data-section="stage-title"]').then(($ele) => {
        expect($ele.text()).to.eq("Untriaged");
      })
      cy.get('div.octicon-wrapper .octicon').first().should('be.visible');
      cy.get('span[data-section="epic-title"]').last().should('be.visible');
      cy.contains('Create Issue').should('be.visible').click();
      cy.get('div[data-errors-for="title"]').first().should('contain', "Please enter an issue title");
      cy.get('button.issue-form-command').click();
    })

  context('At List View', () => {
    beforeEach(function () {
      cy.location('pathname').then((loc) => {
        if (loc == '/projects/' + user.projectId + '/board') {
          clickOn('a#filter-format');
          clickOn('input[value="list"]');
          cy.route('GET', '/projects/*/views?include_counts=true&scope=issues&view_type=issues').as('verifyListView');
          cy.wait('@verifyListView');
        }
      })
      cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
      cy.route('POST', '/projects/*/issues').as('createIssue');
      cy.route('GET', '/projects/*/issues/*.json?filter={}').as('verifyCreateIssue');
    })

    afterEach(function () {
      cy.get('div[data-id="-"] div.issue-title').contains(random).click({ force: true });
      cy.wait(400)
      cy.get('span.issue-form-title').should('contain', random);
      cy.get('button.issue-form-status').should('contain', 'Open').click();
      clickOnElement('button.issue-form-command', 'last');
      cy.wait('@verifyCreateIssue');
    })

    it('verify user able to create issue successfully with default setting #CRISU_002', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      cy.contains('Create Issue').click();
      cy.wait('@createIssue');
      cy.get('button.issue-form-command').click();
      cy.wait('@verifyCreateIssue');
      cy.get('div.flash-tab-container div').last().should('contain', 'Issue created:').and('contain',random)
      cy.get('div[data-id="-"] div.issue-title').first().should('contain', random);
    })

    it('verify user able to create issue successfully with all setting #CRISU_006 #CRISU_010 #CRISU_011', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
      clickOn('(//input[@name="stage"])[2]')
      clickOnElement('div.octicon-wrapper .octicon', "first");
      clickOnElement('input[type="checkbox"]', "first");
      clickOn('//*[contains(text(),"No assignees")]');
      clickOn('(//span[contains(text(),"' + user.name + '")])[2]');
      cy.contains('Create Issue').click();
      cy.wait('@createIssue');
      cy.get('button.issue-form-command').click();
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="-"] div.issue-title').first().should("contain", random);
      cy.get('div[data-id="-"] div.issue-stage').first().should("contain", "Backlog");
      cy.get('span.assignees span.name').first().should("contain", user.name);
    })

    it('verify user able to create issue successfully with priority setting #CRISU_005', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      clickOnElement('div.issue-form-priority input', "last");
      cy.contains('Create Issue').click({ force: true });
      cy.wait('@createIssue');
      clickOn('button.issue-form-command');
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="-"] div.issue-title').last().should('contain', random);
    })

    it('verify user able to create issue successfully with stage option In Progress #CRISU_007', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
      clickOn('(//input[@name="stage"])[3]')
      cy.contains('Create Issue').click({ force: true });
      cy.wait('@createIssue');
      clickOn('button.issue-form-command');
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="-"] div.issue-title').first().should('contain', random);
      cy.get('div[data-id="-"] div.issue-stage').first().should("contain", "In Progress");
    })
  })

  context('At Board View', () => {
    
    beforeEach(function () {
      cy.location('pathname').then((loc) => {
        if (loc == '/projects/' + user.projectId + '/issues') {
          clickOn('a#filter-format');
          clickOn('input[value="board"]');
          cy.route('GET', '/projects/*/views?include_counts=true&scope=issues&view_type=board').as('verifyBoardView');
          cy.wait('@verifyBoardView');
        }
      })
      cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
      cy.route('POST', '/projects/*/issues').as('createIssue');
      cy.route('GET', '/projects/*/cards/*?filter={}').as('verifyCreateIssue');
    })

    afterEach(function () {
      cy.get('h3.board-card-title').contains(random).click({ force: true });
      cy.wait(400)
      cy.get('span.issue-form-title').should('contain', random);
      cy.get('button.issue-form-status').should('contain', 'Open').click();
      clickOnElement('button.issue-form-command', 'last');
      cy.wait('@verifyCreateIssue');
    })

    it('verify user able to create issue successfully with default setting #CRISU_002', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      cy.contains('Create Issue').click();
      cy.wait('@createIssue');
      cy.get('button.issue-form-command').click();
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="backlog"] h3.board-card-title').first().should('contain', random);
    })


    it('verify user able to create issue successfully with all setting #CRISU_006 #CRISU_010 #CRISU_011', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
      clickOn('(//input[@name="stage"])[2]')
      clickOnElement('div.octicon-wrapper .octicon', "first");
      clickOnElement('input[type="checkbox"]', "first");
      clickOn('//*[contains(text(),"No assignees")]');
      clickOn('(//span[contains(text(),"' + user.name + '")])[2]');
      cy.contains('Create Issue').click();
      cy.wait('@createIssue');
      cy.get('button.issue-form-command').click();
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="w8Uj"] h3.board-card-title').first().should('contain', random);
      cy.get('div[data-id="w8Uj"] div[data-role="assignee"] span').first().should("have.attr", "data-original-title", "Assigned to " + user.name);
    })

    it('verify user able to create issue successfully with priority setting #CRISU_005', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      clickOnElement('div.issue-form-priority input', "last");
      cy.contains('Create Issue').click({ force: true });
      cy.wait('@createIssue');
      clickOn('button.issue-form-command');
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="backlog"] h3.board-card-title').last().should('contain', random);
    })

    it('verify user able to create issue successfully with stage option In Progress #CRISU_007', () => {
      cy.contains('Add Issue').click();
      cy.wait(400);
      cy.get('#title').type("Test Issue " + random);
      cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
      clickOn('(//input[@name="stage"])[3]')
      cy.contains('Create Issue').click({ force: true });
      cy.wait('@createIssue');
      clickOn('button.issue-form-command');
      cy.wait('@verifyCreateIssue');
      cy.get('div[data-id="qh6H"] h3.board-card-title').first().should('contain', random);
    })
  })
})