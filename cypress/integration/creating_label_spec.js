/// <reference types="Cypress" />

import { randomString, clickOn, setTextOn, clickOnElement, sidestep_login } from './util'

describe('Codetree : Add Label Functionality Tests', () => {
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
    cy.route('GET', '/projects/*/labels?_pjax=[data-pjax-container]').as('verifydeletlabel');
    cy.route('GET', '/projects/*/cards/*?filter={}').as('verifyCreateIssue');
    cy.route("GET", '/projects/*/cards/*?filter={"type":"epic"}').as('verifyEpic');
    cy.route("GET", '/projects/*/board?type=epic&_pjax=[data-pjax-container]').as('addEpics');
    cy.route('POST', '/projects/*/issues').as('createIssue');
    cy.route('GET','/projects/*/issues/*/edit').as('editIssue');
    cy.route('POST','/projects/*/issues/*').as('moveIssueDone');
    cy.route('POST','/projects/*/labels/*').as('@flashMessage');
  })

  it('verify fields at create lable page #CRLB_001', () => {
    clickOn('//span[contains(text(),"Labels")]');
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/labels')
    cy.get('input[name="name"]').should('have.attr', 'placeholder', "Enter a label name");
    cy.get('input[value="Add label"]').should('be.disabled');
    cy.get('div.color-preview').should(($div) => {
      expect($div, 'Default White color').to.have.css("background-color", "rgb(251, 244, 239)")
    });
    cy.get('div.inline a[data-behavior="sync"]').should(($a) => {
      expect($a, 'Refresh Button').contain('Refresh')
    })
  })

  it('verify error message when add label with choose color setting CRLB_004', () => {
    clickOn('//span[contains(text(),"Labels")]');
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/labels')
    setTextOn('input[name="name"]', "Test Label " + random);
    cy.get('input[value="Add label"]').should('be.enabled').click();
    cy.get('div.new-label-form div.in').should('contain', 'Color must be a valid RGB color');
  })

  it('add and verify new label with different color setting #CRLB_002 #CRLB_003', () => {
    clickOn('//span[contains(text(),"Labels")]');
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/labels')
    setTextOn('input[name="name"]', "Test Label " + random);
    clickOn('div.color-preview');
    setTextOn('div.color-value-wrapper input[type="text"]', "#eb6420");
    cy.get('input[value="Add label"]').should('be.enabled').click();
    cy.get('tbody tr td.col-name').should('contain', random);
    cy.get('.col-name a').contains(random).parent().prev('td').children().should(($div) => {
      expect($div, 'Red color').to.have.attr('style', "background-color: #eb6420")
    });
  })

  it('verify new created lable not assinged to any issue in both List and Board view CRLB_009', () => {
    clickOn('//span[contains(text(),"Labels")]');
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/labels')
    cy.get('tbody tr td.col-name a').contains(random).click();
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/board')
    cy.get('.board-card-details').should('have.length', '0');
    clickOn('a#filter-format');
    clickOn('input[value="list"]');
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/issues')
    cy.get('tr[data-item="issue"]').should('have.length', '0');
  })

  it('verify created lable add in create issue functionality CRLB_010', () => {
    cy.contains('Add Issue').click();
    cy.wait(400);
    cy.get('#title').type("Test Issue " + random);
    clickOnElement('div.octicon-wrapper .octicon', "first");
    setTextOn('div.label-menu input.text-field', random)
    cy.get('span.label-menu-label').contains(random).parent().prev('input').click();
    cy.get('ul[class="issue-labels issue-form-labels"] li').should('contain', random);
    cy.contains('Create Issue').click();
    cy.wait('@createIssue');
    clickOn('button.issue-form-command');
    clickOn('//a/span[contains(text(),"Issues")]');
    cy.wait('@verifyCreateIssue');
    cy.get('div[data-id="backlog"] ul.issue-labels li').first().should('contain', random);
  })

  it('verify created lable add in create epic functionality CRLB_011', () => {
    clickOn('//span[contains(text(),"Epics")]');
    cy.wait('@addEpics');
    clickOn('button.add-issue-carat');
    clickOn('a[data-component="new-epic-controls"]');
    cy.wait(300);
    setTextOn('input.new-title-field', "Test Epic " + random);
    clickOnElement('div.octicon-wrapper .octicon', "first");
    setTextOn('div.label-menu input.text-field', random)
    cy.get('span.label-menu-label').contains(random).parent().prev('input').click();
    cy.get('ul[class="issue-labels issue-form-labels"] li').should('contain', random);
    clickOn('button[data-behavior="create-issue"]');
    clickOn('button.issue-form-command');
    cy.wait('@verifyEpic');
    cy.get('div[data-id="backlog"] ul.issue-labels li').first().should('contain', random);
  })

  it('verify created label edit successfully CRLB_005 CRLB_006', () => {
    clickOn('//span[contains(text(),"Labels")]');
    cy.get('.col-name a').contains(random).parent().next('td').children().first().click();
    cy.get('h4.modal-title').should(($lis) => {
      expect($lis, 'Title of Window').contain('Edit Label')
    })
    cy.get('input#name').as('nameInputText').should('contain.value', random);
    cy.get('@nameInputText').click().clear().should('have.value', '');
    cy.get('input.button').last().should('have.value', 'Save Label').as('saveLableButton').click();
    cy.get('@nameInputText').next('div').should('contain', 'Please enter a name');
    cy.get('@nameInputText').type('Updated ' + random);
    cy.get('#color').as('colorInputText').clear();
    cy.get('@colorInputText').type('#fbca04');
    cy.get('@saveLableButton').click();
    cy.wait('@flashMessage');
    cy.get('div.flash-tab-container div').first().should('contain', ' Labels updated')
    cy.get('tbody tr td.col-name').should('contain', 'Updated ' + random);
    cy.get('.col-name a').contains(random).parent().prev('td').children().should(($div) => {
      expect($div, 'Red color').to.have.attr('style', "background-color: #fbca04")
    });
  })

  it('verify created label delete successfully CRLB_007 CRLB_008', () => {
    clickOn('//span[contains(text(),"Labels")]');
    cy.get('.col-name a').contains(random).parent().next('td').children().last().as('deleteButton')
    cy.get('@deleteButton').trigger('mousedown').should('contain', 'Hold to delete');
    cy.wait('@verifydeletlabel');
    cy.get('div.flash-tab-container div').first().should('contain', ' Label deleted')
    cy.get('tbody tr td.col-name').should('not.contain', random);
  })

  it('verify deleted lable removed from created issue CRLB_012', () => {
    cy.get('div[data-id="backlog"] ul.issue-labels').children().should('have.length', 0)
    cy.get('div[data-id="backlog"] .board-card-details h3').contains(random).click();
    cy.wait('@editIssue');
    cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
    cy.get('input#stage_done').last().click();
    cy.wait('@moveIssueDone');
  })

  it('verify deleted lable removed from created epic CRLB_013', () => {
    clickOn('//span[contains(text(),"Epics")]');
    cy.wait('@addEpics');
    cy.get('div[data-id="backlog"] ul.issue-labels').children().should('have.length', 0)
    cy.get('div[data-id="backlog"] .board-card-details h3').contains(random).click();
    cy.wait('@editIssue');
    cy.xpath('//span[contains(text(),"Untriaged")]').last().click({ force: true });
    cy.get('input#stage_done').last().click();
  })

})