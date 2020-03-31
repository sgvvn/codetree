/// <reference types="Cypress" />

import { randomString, clickOnElement, clickOn, setTextOn, sidestep_login } from './util'
const MilestonePage = new (require('../pages/MilestonePage'))();

describe('Codetree : Add Milestones functionality Tests', () => {
  var random;
  var user;

  before(function () {
    cy.fixture('users.json').as('usersData');
    cy.get('@usersData').then((users) => {
      user = users.grp1Collaborator;
      random = randomString(4);
    })
  })

  beforeEach(function () {
    cy.server();
    sidestep_login(user.publicId);
    cy.get('.sidebar').should('be.visible');
    clickOn('//span[contains(text(),"Milestones")]')
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones')
    cy.route('GET', '/projects/*/views?include_counts=true&scope=milestones&view_type=').as('verifyCreateMilestone');
    cy.get('table[data-container="milestones"]').as('openMilestones')
  })

  after(function(){
    clickOn('//span[contains(text(),"Milestones")]')
    cy.location('pathname').should('include', 'projects/' + user.projectId + '/milestones');
    MilestonePage.deleteMilestone(random, 'openMilestone');
  })
  it('verify fields at add milestone window #CRMIL_001 #CRMIL_002', () => {
    clickOn('button.add-issue-carat');
    cy.get('a[data-component="new-milestone-controls"]').should('be.visible').click();
    cy.get('h4.modal-title').should(($lis) => {
      expect($lis, 'Title of Window').contain('New Milestone')
    })
    cy.get('input.milestone-title').should('be.visible');
    cy.get('.modal-body :nth-child(2) .text-area').should('be.visible');
    cy.get('div.dr-input div div').first().should('have.attr', 'placeholder', 'Enter an optional start date');
    cy.get('div.dr-input div div').last().should('have.attr', 'placeholder', 'Enter an optional due date');
    cy.get('input.milestone-submit').should('be.visible');
  })

  it('verify title validation functionality at add milestone window CRMIL_003', () => {
    clickOn('button.add-issue-carat');
    clickOn('a[data-component="new-milestone-controls"]');
    clickOn('input.milestone-submit');
    cy.get('div.form-field div[data-errors-for="title"]').should('contain', "Please enter a title");
  })

  it('verify add milestone with all empty field expect title #CRMIL_004', () => {
    clickOn('button.add-issue-carat');
    clickOn('a[data-component="new-milestone-controls"]');
    setTextOn('input.milestone-title', 'Test Milestone '+random)
    clickOn('input.milestone-submit');
    cy.wait('@verifyCreateMilestone');
    cy.get('div.flash-tab-container div').last().should('contain', 'Milestone created')
    cy.get('@openMilestones').first().within(() => {
      cy.get('tr[data-item="milestone"] td.col-milestone').last().should("contain", random)
    })
  })

  it('verify to add milestone successfully with all data field #CRMIL_005', () => {
    cy.get('@openMilestones').first().within(() => {
      cy.get('td.col-milestone a').contains(random).parent().siblings('td.col-settings').should('be.visible').click();
      cy.xpath('//a[@aria-expanded="true"]//following::div//a[@data-behavior="edit"]').eq(0).click();
    })
    cy.get('div.dr-input div div').first().click()
    cy.get('ul.dr-day-list li[class="dr-day"]').first().click();

    cy.get('ul.dr-day-list').children().should('have.length', 0)
    cy.get('div.dr-input div div').last().click()
    if (Cypress.moment().format('DD') == '28') {
      cy.get('ul.dr-day-list li[class="dr-day dr-current"]').contains('28').click();
    }
    else {
      cy.get('ul.dr-day-list li[class="dr-day"]').contains('28').last().click();
    }
    cy.get('[value="Save Milestone"]').should('be.visible').click();
    cy.wait('@verifyCreateMilestone')
    cy.get('@openMilestones').first().within(() => {
      cy.get('tr[data-item="milestone"] td.col-milestone').last().should("contain", random)
      const date = Cypress.moment().format('MMMM') + ' 28, ' + Cypress.moment().format('YYYY');
      cy.get('tr[data-item="milestone"] td.col-due-on').last().should("contain", date)
    })
  })
 
  it('verify Due-Date validation functionality at add milestone window #CRMIL_006', () => {
    MilestonePage.setMilestone(random);
    cy.get('ul.dr-day-list').children().should('have.length', 0)
    cy.get('div.dr-input div div').last().click()
    cy.get('ul.dr-day-list li[class="dr-day"]').first().click();
    clickOn('input.milestone-submit');
    cy.get('div[data-errors-for="due_on"]').should("contain", "Due date must be greater than start date")
  }) 

  it('verify entered Start-Date & Due-Date should be clear when click on clear button #CRMIL_007', () => {
    MilestonePage.setMilestone(random);
    cy.get('div.dr-input div div').last().click()
    clickOnElement('ul.dr-day-list li[class="dr-day"]', "first")
    clickOn('a[data-behavior="clear-start-date"]')
    clickOn('a[data-behavior="clear-due-date"]')
    cy.get('div.dr-input div div').first().should('have.attr', 'placeholder', 'Enter an optional start date')
    cy.get('div.dr-input div div').last().should('have.attr', 'placeholder', 'Enter an optional due date')
  })
})